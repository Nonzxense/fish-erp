package transaction

import (
	"fish/internal/domain"
	"time"
)

type TransactionFilter struct {
	Type      *string    `json:"type"`
	Category  *string    `json:"category"`
	FromDate  *time.Time `json:"fromDate"`
	ToDate    *time.Time `json:"toDate"`
	MinAmount *float64   `json:"minAmount"`
	MaxAmount *float64   `json:"maxAmount"`
	domain.Pagination
}
