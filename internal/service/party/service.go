package party

import (
	"fish/internal/domain"
	partyDomain "fish/internal/domain/party"
	paymentDomain "fish/internal/domain/payment"
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

	totalPaymentsIn, err := s.paymentService.GetPaymentTotalByPartyID(paymentDomain.PaymentIn, id)
	if err != nil {
		return dto.PartyDetailDTO{}, err
	}

	totalPaymentsOut, err := s.paymentService.GetPaymentTotalByPartyID(paymentDomain.PaymentOut, id)
	if err != nil {
		return dto.PartyDetailDTO{}, err
	}

	partyDetail := dto.PartyDetailDTO{
		ID:               party.ID,
		Name:             party.Name,
		Phone:            party.Phone,
		Note:             party.Note,
		TotalReceivable:  party.TotalReceivable,
		TotalPayable:     party.TotalPayable,
		TotalPaymentsIn:  totalPaymentsIn,
		TotalPaymentsOut: totalPaymentsOut,
		Payments:         paymentResult,
	}

	return partyDetail, nil
}
