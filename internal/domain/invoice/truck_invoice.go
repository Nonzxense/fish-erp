package invoice

type Wage struct {
	Name   string  `json:"name"`
	Amount float64 `json:"amount"`
}

type OtherExpense struct {
	Amount float64 `json:"amount"`
	Note   *string `json:"note"`
}

type TruckInvoice struct {
	BaseInvoice
	Driver        Wage   `json:"driver" gorm:"embedded;embeddedPrefix:driver_"`
	Helpers       []Wage `json:"helpers" gorm:"serializer:json"`
	OtherExpenses []OtherExpense
}
