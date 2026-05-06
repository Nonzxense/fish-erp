package common

type Money int64 // สตางค์

func (m Money) Add(other Money) Money {
	return m + other
}

func (m Money) Mul(qty int32) Money {
	return m * Money(qty)
}
