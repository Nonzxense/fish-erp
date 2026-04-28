package invoice

import (
	"fish/internal/domain"
	"time"
)

type InvoiceFilter struct {
	ID           *string    `json:"id"`
	CustomerName *string    `json:"customerName"`
	Status       *string    `json:"status"`
	FromDate     *time.Time `json:"fromDate"`
	ToDate       *time.Time `json:"toDate"`
	domain.Pagination
}
