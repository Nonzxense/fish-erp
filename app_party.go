package main

import (
	"fish/internal/domain"
	"fish/internal/dto"
	"fish/internal/service/party"

	partyDomain "fish/internal/domain/party"
)

func (a *App) CreateParty(input party.CreatePartyInput) error {
	return a.partyService.CreateParty(input)
}

func (a *App) GetParties(filter *partyDomain.PartyFilter) (domain.PageResult[partyDomain.PartyWithDebt], error) {
	return a.partyService.GetParties(filter)
}

func (a *App) GetParty(partyID string) (dto.PartyDetailDTO, error) {
	return a.partyService.GetParty(partyID)
}

func (a *App) UpdateParty(id string, input party.CreatePartyInput) error {
	return a.partyService.UpdateParty(id, input)
}
