package invoice

import (
	containerDomain "fish/internal/domain/container"
	invoiceDomain "fish/internal/domain/invoice"
	partyDomain "fish/internal/domain/party"
	"fish/internal/repository"
	container "fish/internal/service/container"
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
	return &InvoiceService{repo: repo}
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

// --- Helpers ---

func (s *InvoiceService) resolveCustomer(input CreateFishTradeInvoiceInput) (partyDomain.Party, error) {
	if !input.IsNewCustomer {
		return s.partyRepo.FindOne(input.CustomerID)
	}

	customer := partyDomain.Party{
		ID:   uuid.NewString(),
		Name: input.NewCustomerName,
	}
	return customer, s.partyRepo.CreateParty(&customer)
}

func (s *InvoiceService) resolveContainerID(input container.CreateFishContainerInput) (uint, error) {
	if !input.IsNewContainer {
		return input.ContainerID, nil
	}

	newContainer := containerDomain.Container{
		ID:     input.NewContainerID,
		Color:  input.NewContainerColor,
		Type:   input.NewContainerType,
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
			FishName:   f.FishName,
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
