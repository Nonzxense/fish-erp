package party

import (
	"fish/internal/domain/common"
)

type Party struct {
	ID    string  `json:"id" gorm:"primaryKey"`
	Name  string  `json:"name"`
	Phone *string `json:"phone"`
	Note  *string `json:"note"`
}

type PartyWithDebt struct {
	ID              string       `json:"id"`
	Name            string       `json:"name"`
	Phone           *string      `json:"phone"`
	Note            *string      `json:"note"`
	TotalReceivable common.Money `json:"totalReceivable"`
	TotalPayable    common.Money `json:"totalPayable"`
}
