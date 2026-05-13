package invoice

import (
	"fish/internal/domain"
	"fish/internal/domain/common"
	containerDomain "fish/internal/domain/container"
	invoiceDomain "fish/internal/domain/invoice"
	partyDomain "fish/internal/domain/party"
	"fish/internal/repository"
	container "fish/internal/service/container"
	"fish/internal/utils/count"
	"fish/internal/utils/ptr"
	"fmt"
	"log"
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
	log.Printf("CREATE INVOICE SERVICE: %+v", input)
	invoice, err := s.buildFishSaleInvoice(input)
	if err != nil {
		log.Printf("CREATE INVOICE SERVICE FAILED: %+v", err)
		return err
	}

	return s.repo.CreateFishSaleInvoice(invoice)
}

func (s *InvoiceService) CreateFishPurchaseInvoice(input CreateFishPurchaseInvoiceInput) error {
	invoice, err := s.buildFishPurchaseInvoice(input)
	if err != nil {
		return err
	}

	return s.repo.CreateFishPurchaseInvoice(invoice)
}

func (s *InvoiceService) GetFishSaleInvoices(filter *invoiceDomain.InvoiceFilter) (domain.PageResult[invoiceDomain.FishSaleInvoice], error) {
	invoices, total, err := s.repo.FindAllFishSaleInvoices(filter)

	pageResult := domain.PageResult[invoiceDomain.FishSaleInvoice]{
		Data:  invoices,
		Total: total,
	}

	return pageResult, err
}

func (s *InvoiceService) GetFishPurchaseInvoices(filter *invoiceDomain.InvoiceFilter) (domain.PageResult[invoiceDomain.FishPurchaseInvoice], error) {
	invoices, total, err := s.repo.FindAllFishPurchaseInvoices(filter)

	pageResult := domain.PageResult[invoiceDomain.FishPurchaseInvoice]{
		Data:  invoices,
		Total: total,
	}

	return pageResult, err
}

func (s *InvoiceService) GetFishTradeInvoiceSummary(invoiceType string) (invoiceDomain.FishTradeInvoiceSummary, error) {
	return s.repo.GetFishTradeInvoiceSummary(invoiceType)
}

func (s *InvoiceService) UpdateFishSaleInvoice(id string, input CreateFishSaleInvoiceInput) error {
	invoice, err := s.buildFishSaleInvoice(input)
	if err != nil {
		return err
	}
	invoice.ID = id

	return s.repo.UpdateFishSaleInvoice(id, invoice)
}

func (s *InvoiceService) UpdateFishPurchaseInvoice(id string, input CreateFishPurchaseInvoiceInput) error {
	invoice, err := s.buildFishPurchaseInvoice(input)
	if err != nil {
		return err
	}
	invoice.ID = id

	return s.repo.UpdateFishPurchaseInvoice(id, invoice)
}

func (s *InvoiceService) ChangeInvoiceStatus(invoiceType string, id string, status string) error {
	switch invoiceType {
	case "sale":
		return s.repo.ChangeInvoiceStatus(
			&invoiceDomain.FishSaleInvoice{},
			id,
			status,
		)
	case "purchase":
		return s.repo.ChangeInvoiceStatus(
			&invoiceDomain.FishPurchaseInvoice{},
			id,
			status,
		)
	default:
		return fmt.Errorf("invalid invoice type")
	}
}

func (s *InvoiceService) DeleteFishSaleInvoices(ids []string) error {
	return s.repo.DeleteFishSaleInvoices(ids)
}

// --- Helpers ---

func (s *InvoiceService) buildFishSaleInvoice(input CreateFishSaleInvoiceInput) (*invoiceDomain.FishSaleInvoice, error) {
	customer, err := s.resolveParty(PartyInput{
		IsNewParty:   input.IsNewCustomer,
		PartyID:      input.CustomerID,
		NewPartyName: input.NewCustomerName,
	})
	if err != nil {
		return nil, err
	}

	invoice, err := s.initializeSaleInvoice(input, customer)
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

func (s *InvoiceService) buildFishPurchaseInvoice(input CreateFishPurchaseInvoiceInput) (*invoiceDomain.FishPurchaseInvoice, error) {
	supplier, err := s.resolveParty(PartyInput{
		IsNewParty:   input.IsNewSupplier,
		PartyID:      input.SupplierID,
		NewPartyName: input.NewSupplierName,
	})
	if err != nil {
		return nil, err
	}

	invoice, err := s.initializePurchaseInvoice(input, supplier)
	if err != nil {
		return nil, err
	}

	for _, f := range input.Fishes {
		invoice.Fishes = append(invoice.Fishes, containerDomain.FishPurchaseDetail{
			Name:       f.Name,
			WeightKg:   f.WeightKg,
			PricePerKg: common.NewMoney(f.PricePerKg),
		})
	}

	for _, f := range invoice.Fishes {
		invoice.TotalAmount = invoice.TotalAmount.Add(f.PricePerKg.Mul(f.WeightKg))
	}

	return invoice, nil
}

func (s *InvoiceService) resolveParty(input PartyInput) (partyDomain.Party, error) {
	if !input.IsNewParty {
		party, err := s.partyRepo.FindOne(input.PartyID)
		if err != nil {
			return partyDomain.Party{}, err
		}
		return party, nil
	}

	if input.NewPartyName == nil {
		return partyDomain.Party{}, fmt.Errorf("party name is required")
	}

	party := partyDomain.Party{
		ID:   uuid.NewString(),
		Name: *input.NewPartyName,
	}

	err := s.partyRepo.CreateParty(&party)
	return party, err
}

func (s *InvoiceService) resolveContainerID(input container.CreateFishContainerInput) (uint, error) {
	if !input.IsNewContainer {
		err := s.containerRepo.UpdateContainerStatus(
			input.ContainerID,
			"with_customer",
		)
		if err != nil {
			return 0, err
		}

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

	err := s.containerRepo.CreateContainer(&newContainer)
	if err != nil {
		return 0, err
	}

	return newContainer.ID, nil
}

func (s *InvoiceService) initializeSaleInvoice(input CreateFishSaleInvoiceInput, customer partyDomain.Party) (*invoiceDomain.FishSaleInvoice, error) {
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

func (s *InvoiceService) initializePurchaseInvoice(input CreateFishPurchaseInvoiceInput, supplier partyDomain.Party) (*invoiceDomain.FishPurchaseInvoice, error) {
	c, err := count.GetCountForMonth[invoiceDomain.FishPurchaseInvoice](s.repo.GetDB(), input.CreatedAt)
	if err != nil {
		return nil, err
	}

	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return nil, err
	}

	sequenceID := fmt.Sprintf("FP-%d%02d-%04d",
		input.CreatedAt.In(loc).Year(),
		input.CreatedAt.In(loc).Month(),
		c+1,
	)

	return &invoiceDomain.FishPurchaseInvoice{
		BaseInvoice: invoiceDomain.BaseInvoice{
			ID:        sequenceID,
			CreatedAt: input.CreatedAt,
			Type:      input.Type,
			Status:    input.Status,
			Note:      input.Note,
		},
		SupplierID: supplier.ID,
		Supplier:   supplier,
		Fishes:     []containerDomain.FishPurchaseDetail{},
	}, nil
}

func (s *InvoiceService) mapFishToContainer(invoiceID string, containerID uint, fishes []container.CreateFishDetailInput) containerDomain.FishContainer {
	fc := containerDomain.FishContainer{
		InvoiceId:   invoiceID,
		ContainerID: containerID,
	}
	for _, f := range fishes {
		fc.Fishes = append(fc.Fishes, containerDomain.FishSaleDetail{
			FishContainerID: containerID,
			Name:            f.Name,
			WeightKg:        f.WeightKg,
			PricePerKg:      common.NewMoney(f.PricePerKg),
		})
	}
	return fc
}

func (s *InvoiceService) calculateContainerTotal(fc containerDomain.FishContainer) common.Money {
	var total common.Money
	for _, f := range fc.Fishes {
		total += f.PricePerKg.Mul(f.WeightKg)
	}
	return total
}
