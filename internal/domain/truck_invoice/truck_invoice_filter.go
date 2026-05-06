package truckinvoice

import (
	"fish/internal/domain"
	"time"
)

type TruckInvoiceFilter struct {
	ID       *string    `json:"id"`
	CarPlate *string    `json:"carPlate"`
	Status   *string    `json:"status"`
	FromDate *time.Time `json:"fromDate"`
	ToDate   *time.Time `json:"toDate"`
	domain.Pagination
}
