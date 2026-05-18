package payment

import (
	"fish/internal/constants"
	"fish/internal/domain/common"
	"fish/internal/domain/payment"
	"fish/internal/domain/transaction"
	"fish/internal/repository"
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

func (s *PaymentService) AllocatePaymentFIFO(
	input PaymentInput,
) error {

	invoices, err := s.paymentRepo.GetUnpaidInvoicesByPartyID(input.PartyID)

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
	input PaymentInput,
) (*payment.Payment, error) {

	p := payment.Payment{
		Amount:      common.NewMoney(input.Amount),
		PaymentDate: input.PaymentDate,
		PartyID:     input.PartyID,
		Direction:   input.Direction,
		Note:        input.Note,
	}

	err := s.paymentRepo.CreatePayment(tx, &p)

	if err != nil {
		return nil, err
	}

	transactionType := "income"

	if input.Direction == constants.PaymentOut {
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
