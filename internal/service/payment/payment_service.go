package payment

import (
	"fish/internal/domain"
	"fish/internal/domain/common"
	invoiceDomain "fish/internal/domain/invoice"
	"fish/internal/domain/payment"
	paymentDomain "fish/internal/domain/payment"
	"fish/internal/domain/transaction"
	truckInvoiceDomain "fish/internal/domain/truck_invoice"
	"fish/internal/dto"
	"fish/internal/repository"
	"fmt"
	"slices"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PaymentService struct {
	paymentRepo     *repository.PaymentRepository
	transactionRepo *repository.TransactionRepository
	db              *gorm.DB
}

func NewPaymentService(
	paymentRepo *repository.PaymentRepository,
	transactionRepo *repository.TransactionRepository,
	db *gorm.DB,
) *PaymentService {
	return &PaymentService{
		paymentRepo:     paymentRepo,
		transactionRepo: transactionRepo,
		db:              db,
	}
}

func (s *PaymentService) PayInvoice(
	input dto.PayInvoiceInput,
) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		p, err := s.CreatePayment(tx, input.PaymentInput)
		if err != nil {
			return err
		}

		allocation := common.NewMoney(input.Amount)

		err = s.paymentRepo.ApplyPayment(
			tx,
			input.ReferenceType,
			input.ReferenceID,
			allocation,
		)
		if err != nil {
			return err
		}

		err = s.paymentRepo.CreateAllocation(
			tx,
			input.ReferenceType,
			input.ReferenceID,
			allocation,
			p.ID,
		)

		return err
	})
}

func (s *PaymentService) AllocatePaymentFIFO(
	input dto.PaymentInput,
) error {

	invoices, err := s.paymentRepo.GetUnpaidInvoicesByPartyID(input.PartyID, input.Direction)

	if err != nil {
		return err
	}

	slices.SortFunc(invoices, func(a, b payment.UnpaidInvoice) int {
		return a.CreatedAt.Compare(b.CreatedAt)
	})

	return s.db.Transaction(func(tx *gorm.DB) error {

		p, err := s.CreatePayment(tx, input)

		if err != nil {
			return err
		}

		remainingAmount := common.NewMoney(input.Amount)

		for _, inv := range invoices {

			if remainingAmount <= 0 {
				break
			}

			remainingInvoice := inv.TotalAmount - inv.PaidAmount

			allocation := min(remainingAmount, remainingInvoice)

			err := s.paymentRepo.ApplyPayment(
				tx,
				inv.ReferenceType,
				inv.ReferenceID,
				allocation,
			)

			if err != nil {
				return err
			}

			err = s.paymentRepo.CreateAllocation(
				tx,
				inv.ReferenceType,
				inv.ReferenceID,
				allocation,
				p.ID,
			)

			if err != nil {
				return err
			}

			remainingAmount -= allocation
		}

		return nil
	})
}

func (s *PaymentService) CreatePayment(
	tx *gorm.DB,
	input dto.PaymentInput,
) (*payment.Payment, error) {

	p := payment.Payment{
		Amount:      common.NewMoney(input.Amount),
		PaymentDate: input.PaymentDate,
		PartyID:     input.PartyID,
		Direction:   input.Direction,
		Method:      input.Method,
		Note:        input.Note,
	}

	err := s.paymentRepo.CreatePayment(tx, &p)

	if err != nil {
		return nil, err
	}

	transactionType := "income"

	if input.Direction == payment.PaymentOut {
		transactionType = "expense"
	}

	t := transaction.Transaction{
		ID:         uuid.NewString(),
		Amount:     common.NewMoney(input.Amount),
		Type:       transactionType,
		OccurredAt: input.PaymentDate,
		PaymentID:  &p.ID,
		Note:       input.Note,
	}

	err = s.transactionRepo.CreateWithTx(tx, &t)

	if err != nil {
		return nil, err
	}

	return &p, nil
}

func (s *PaymentService) GetPaymentsByPartyID(partyID string) (domain.PageResult[paymentDomain.Payment], error) {
	payments, total, err := s.paymentRepo.GetPaymentsByPartyID(partyID)

	pageResult := domain.PageResult[paymentDomain.Payment]{
		Data:  payments,
		Total: total,
	}

	return pageResult, err
}

func (s *PaymentService) GetPaymentTotalByPartyID(
	direction paymentDomain.PaymentDirection,
	partyID string,
) (common.Money, error) {
	return s.paymentRepo.GetPaymentTotalByPartyID(
		direction,
		partyID,
	)
}

func (s *PaymentService) RollbackPayment(paymentID uint) error {
	allocations, err := s.paymentRepo.GetAllocationsByPaymentID(paymentID)

	if err != nil {
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		for _, allocation := range allocations {
			refType := allocation.ReferenceType
			refId := allocation.ReferenceID

			var model any
			switch refType {
			case paymentDomain.RefFishPurchaseInvoice:
				model = &invoiceDomain.FishPurchaseInvoice{}
			case paymentDomain.RefFishSaleInvoice:
				model = &invoiceDomain.FishSaleInvoice{}
			case paymentDomain.RefTruckInvoice:
				model = &truckInvoiceDomain.ShippingInvoice{}
			default:
				return fmt.Errorf("invalid reference type.")
			}

			if err := tx.Model(model).
				Where("id = ?", refId).
				Update(
					"paid_amount",
					gorm.Expr("paid_amount - ?", allocation.AllocatedAmount),
				).Error; err != nil {
				return err
			}
		}

		if err := tx.Delete(&allocations).Error; err != nil {
			return err
		}

		return tx.Delete(&paymentDomain.Payment{}, paymentID).Error
	})
}
