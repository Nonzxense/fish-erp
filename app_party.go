package main

import (
	"fish/internal/domain"
	"fish/internal/service/party"

	partyDomain "fish/internal/domain/party"
)

func (a *App) CreateParty(input party.CreatePartyInput) error {
	return a.partyService.CreateParty(input)
}

func (a *App) GetParties(filter *partyDomain.PartyFilter) (domain.PageResult[partyDomain.Party], error) {
	return a.partyService.GetParties(filter)
}
