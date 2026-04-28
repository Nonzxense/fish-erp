package party

import "fish/internal/domain"

type PartyFilter struct {
	Name  *string `json:"name"`
	Type  *string `json:"type"`
	Phone *string `json:"phone"`
	domain.Pagination
}
