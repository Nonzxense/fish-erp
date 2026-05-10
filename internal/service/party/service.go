package party

import (
	"fish/internal/domain"
	partyDomain "fish/internal/domain/party"
	"fish/internal/repository"

	"github.com/google/uuid"
)

type PartyService struct {
	repo *repository.PartyRepository
}

func NewPartyService(repo *repository.PartyRepository) *PartyService {
	return &PartyService{repo: repo}
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

func (s *PartyService) GetParty(id string) (partyDomain.Party, error) {
	return s.repo.FindOne(id)
}