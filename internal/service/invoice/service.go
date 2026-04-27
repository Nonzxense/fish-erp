package invoice

import (
	"fish/internal/domain"
	containerDomain "fish/internal/domain/container"
	invoiceDomain "fish/internal/domain/invoice"
	partyDomain "fish/internal/domain/party"
	"fish/internal/repository"
	container "fish/internal/service/container"
	"fish/internal/utils/count"
	"fish/internal/utils/ptr"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type InvoiceService struct {
	repo          *repository.InvoiceRepository
	partyRepo     *repository.PartyRepository
	containerRepo *repository.ContainerRepository
}

func NewInvoiceService(
	repo *repository.InvoiceRepository,
	partyRepo *repository.PartyRepository,
	containerRepo *repository.ContainerRepository,
) *InvoiceService {
	return &InvoiceService{repo: repo, partyRepo: partyRepo, containerRepo: containerRepo}
}

func (s *InvoiceService) CreateFishSaleInvoice(input CreateFishSaleInvoiceInput) error {
	invoice, err := s.buildFishSaleInvoice(input)
	if err != nil {
		return err
	}

	return s.repo.CreateFishSaleInvoice(invoice)
}

func (s *InvoiceService) GetFishSaleInvoices(filter *invoiceDomain.InvoiceFilter) (domain.PageResult[invoiceDomain.FishSaleInvoice], error) {
	invoices, total, err := s.repo.FindAllFishSaleInvoices(filter)

	pageResult := domain.PageResult[invoiceDomain.FishSaleInvoice]{
		Data:  invoices,
		Total: total,
	}

	return pageResult, err
}

func (s *InvoiceService) UpdateFishSaleInvoice(id string, input CreateFishSaleInvoiceInput) error {
	invoice, err := s.buildFishSaleInvoice(input)
	if err != nil {
		return err
	}
	invoice.ID = id

	return s.repo.UpdateFishSaleInvoice(id, invoice)
}

func (s *InvoiceService) ChangeInvoiceStatus(id string, status string) error {
	return s.repo.ChangeInvoiceStatus(id, status)
}

func (s *InvoiceService) DeleteFishSaleInvoices(ids []string) error {
	return s.repo.DeleteFishSaleInvoices(ids)
}

// --- Helpers ---

func (s *InvoiceService) buildFishSaleInvoice(input CreateFishSaleInvoiceInput) (*invoiceDomain.FishSaleInvoice, error) {
	customer, err := s.resolveCustomer(input)
	if err != nil {
		return nil, err
	}

	invoice, err := s.initializeInvoice(input, customer)
	if err != nil {
		return nil, err
	}

	for _, containerInput := range input.Items {
		containerID, err := s.resolveContainerID(containerInput)
		if err != nil {
			return nil, err
		}

		fishContainer := s.mapFishToContainer(
			invoice.ID,
			containerID,
			containerInput.Fishes,
		)

		invoice.Items = append(invoice.Items, fishContainer)
		invoice.TotalAmount += s.calculateContainerTotal(fishContainer)
	}

	return invoice, nil
}

func (s *InvoiceService) resolveCustomer(input CreateFishSaleInvoiceInput) (partyDomain.Party, error) {
	if !input.IsNewCustomer {
		customer, err := s.partyRepo.FindOne(input.CustomerID)
		if err != nil {
			return partyDomain.Party{}, err
		}
		return customer, nil
	}

	if input.NewCustomerName == nil {
		return partyDomain.Party{}, fmt.Errorf("customer name is required for new customers")
	}

	customer := partyDomain.Party{
		ID:   uuid.NewString(),
		Name: *input.NewCustomerName,
	}

	err := s.partyRepo.CreateParty(&customer)
	return customer, err
}

func (s *InvoiceService) resolveContainerID(input container.CreateFishContainerInput) (uint, error) {
	if !input.IsNewContainer {
		return input.ContainerID, nil
	}

	if input.NewContainerID == nil {
		return 0, fmt.Errorf("new container ID is required")
	}

	newContainer := containerDomain.Container{
		ID:     *input.NewContainerID,
		Status: ptr.String("with_customer"),
	}

	if input.NewContainerColor != nil {
		newContainer.Color = *input.NewContainerColor
	}
	if input.NewContainerType != nil {
		newContainer.Type = *input.NewContainerType
	}

	return newContainer.ID, s.containerRepo.CreateContainer(&newContainer)
}

func (s *InvoiceService) initializeInvoice(input CreateFishSaleInvoiceInput, customer partyDomain.Party) (*invoiceDomain.FishSaleInvoice, error) {
	c, err := count.GetCountForMonth[invoiceDomain.FishSaleInvoice](s.repo.GetDB(), input.CreatedAt)
	if err != nil {
		return nil, err
	}

	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return nil, err
	}

	sequenceID := fmt.Sprintf("FS-%d%02d-%04d",
		input.CreatedAt.In(loc).Year(),
		input.CreatedAt.In(loc).Month(),
		c+1,
	)

	return &invoiceDomain.FishSaleInvoice{
		BaseInvoice: invoiceDomain.BaseInvoice{
			ID:        sequenceID,
			CreatedAt: input.CreatedAt,
			Type:      input.Type,
			Status:    input.Status,
			Note:      input.Note,
		},
		CustomerID: customer.ID,
		Customer:   customer,
		Items:      []containerDomain.FishContainer{},
	}, nil
}

func (s *InvoiceService) mapFishToContainer(invoiceID string, containerID uint, fishes []container.CreateFishDetailInput) containerDomain.FishContainer {
	fc := containerDomain.FishContainer{
		InvoiceId:   invoiceID,
		ContainerID: containerID,
	}
	for _, f := range fishes {
		fc.Fishes = append(fc.Fishes, containerDomain.FishDetail{
			FishContainerID: containerID,
			Name:            f.Name,
			WeightKg:        f.WeightKg,
			PricePerKg:      f.PricePerKg,
		})
	}
	return fc
}

func (s *InvoiceService) calculateContainerTotal(fc containerDomain.FishContainer) float64 {
	var total float64
	for _, f := range fc.Fishes {
		total += f.WeightKg * f.PricePerKg
	}
	return total
}
