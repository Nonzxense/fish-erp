package party

import (
	"fish/internal/domain"
	partyDomain "fish/internal/domain/party"
	"fish/internal/dto"
	"fish/internal/repository"
	"fish/internal/service/invoice"
	"fish/internal/service/payment"

	"github.com/google/uuid"
)

type PartyService struct {
	repo           *repository.PartyRepository
	paymentService *payment.PaymentService
	invoiceService *invoice.InvoiceService
}

func NewPartyService(repo *repository.PartyRepository, paymentService *payment.PaymentService) *PartyService {
	return &PartyService{repo: repo, paymentService: paymentService}
}

func (s *PartyService) CreateParty(input CreatePartyInput) error {
	party := &partyDomain.Party{
		ID:    uuid.NewString(),
		Name:  input.Name,
		Phone: input.Phone,
		Note:  input.Note,
	}
	return s.repo.CreateParty(party)
}

func (s *PartyService) GetParties(filter *partyDomain.PartyFilter) (domain.PageResult[partyDomain.PartyWithDebt], error) {
	parties, total, error := s.repo.FindAll(filter)
	pageResult := domain.PageResult[partyDomain.PartyWithDebt]{
		Data:  parties,
		Total: total,
	}
	return pageResult, error
}

func (s *PartyService) GetParty(id string) (dto.PartyDetailDTO, error) {
	party, err := s.repo.GetByIDWithDebt(id)
	if err != nil {
		return dto.PartyDetailDTO{}, err
	}

	paymentResult, err := s.paymentService.GetPaymentsByPartyID(id)
	if err != nil {
		return dto.PartyDetailDTO{}, err
	}

	totalPayments, err := s.paymentService.GetPaymentTotalByPartyID(id)
	if err != nil {
		return dto.PartyDetailDTO{}, err
	}

	partyDetail := dto.PartyDetailDTO{
		ID:            party.ID,
		Name:          party.Name,
		Phone:         party.Phone,
		Note:          party.Note,
		TotalDebt:     party.TotalDebt,
		TotalPayments: totalPayments,
		Payments:      paymentResult,
	}

	return partyDetail, nil
}
