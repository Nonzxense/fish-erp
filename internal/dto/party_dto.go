package dto

import (
	"fish/internal/domain"
	"fish/internal/domain/common"
	invoiceDomain "fish/internal/domain/invoice"
	paymentDomain "fish/internal/domain/payment"
)

type PartyDetailDTO struct {
	ID               string       `json:"id"`
	Name             string       `json:"name"`
	Phone            *string      `json:"phone"`
	Note             *string      `json:"note"`
	TotalReceivable  common.Money `json:"totalReceivable"`
	TotalPayable     common.Money `json:"totalPayable"`
	TotalPaymentsIn  common.Money `json:"totalPaymentsIn"`
	TotalPaymentsOut common.Money `json:"totalPaymentsOut"`

	Payments         domain.PageResult[paymentDomain.Payment]             `json:"payments"`
	SaleInvoices     domain.PageResult[invoiceDomain.FishSaleInvoice]     `json:"saleInvoices"`
	PurchaseInvoices domain.PageResult[invoiceDomain.FishPurchaseInvoice] `json:"purchaseInvoice"`
}
