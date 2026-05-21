package dto

import (
	"fish/internal/domain"
	"fish/internal/domain/common"
	invoiceDomain "fish/internal/domain/invoice"
	paymentDomain "fish/internal/domain/payment"
)

type PartyDetailDTO struct {
	ID        string       `json:"id"`
	Name      string       `json:"name"`
	Phone     *string      `json:"phone"`
	Note      *string      `json:"note"`
	TotalDebt common.Money `json:"totalDebt"`

	Payments         domain.PageResult[paymentDomain.Payment]             `json:"payments"`
	SaleInvoices     domain.PageResult[invoiceDomain.FishSaleInvoice]     `json:"saleInvoices"`
	PurchaseInvoices domain.PageResult[invoiceDomain.FishPurchaseInvoice] `json:"purchaseInvoice"`
}
