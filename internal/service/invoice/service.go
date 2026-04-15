package invoice

import (
	"fish/internal/domain"
	containerDomain "fish/internal/domain/container"
	invoiceDomain "fish/internal/domain/invoice"
	partyDomain "fish/internal/domain/party"
	"fish/internal/ptr"
	"fish/internal/repository"
	container "fish/internal/service/container"
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

func (s *InvoiceService) CreateFishTradeInvoice(input CreateFishTradeInvoiceInput) error {
	customer, err := s.resolveCustomer(input)
	if err != nil {
		return err
	}

	invoice := s.initializeInvoice(input, customer)

	for _, containerInput := range input.Items {
		containerID, err := s.resolveContainerID(containerInput)
		if err != nil {
			return err
		}

		fishContainer := s.mapFishToContainer(invoice.ID, containerID, containerInput.Fishes)

		invoice.Items = append(invoice.Items, fishContainer)
		invoice.TotalAmount += s.calculateContainerTotal(fishContainer)
	}

	return s.repo.CreateFishTradeInvoice(invoice)
}

func (s *InvoiceService) GetFishTradeInvoices(filter *invoiceDomain.InvoiceFilter) (domain.PageResult[invoiceDomain.FishTradeInvoice], error) {
	invoices, total, err := s.repo.FindAllFishTradeInvoices(filter)

	pageResult := domain.PageResult[invoiceDomain.FishTradeInvoice]{
		Data:  invoices,
		Total: total,
	}

	return pageResult, err
}

// --- Helpers ---

func (s *InvoiceService) resolveCustomer(input CreateFishTradeInvoiceInput) (partyDomain.Party, error) {
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

func (s *InvoiceService) initializeInvoice(input CreateFishTradeInvoiceInput, customer partyDomain.Party) *invoiceDomain.FishTradeInvoice {
	return &invoiceDomain.FishTradeInvoice{
		BaseInvoice: invoiceDomain.BaseInvoice{
			ID:        uuid.NewString(),
			CreatedAt: time.Now(),
			Type:      input.Type,
			Status:    input.Status,
			Note:      input.Note,
		},
		CustomerID: customer.ID,
		Customer:   customer,
		Items:      []containerDomain.FishContainer{},
	}
}

func (s *InvoiceService) mapFishToContainer(invoiceID string, containerID uint, fishes []container.CreateFishDetailInput) containerDomain.FishContainer {
	fc := containerDomain.FishContainer{
		InvoiceId:   invoiceID,
		ContainerID: containerID,
	}
	for _, f := range fishes {
		fc.Fishes = append(fc.Fishes, containerDomain.FishDetail{
			Name:       f.Name,
			WeightKg:   f.WeightKg,
			PricePerKg: f.PricePerKg,
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
