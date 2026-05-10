package common

import "math"

type Money int64 // สตางค์

func NewMoney(v float64) Money {
	return Money(math.Round(v * 100))
}

func (m Money) Add(other Money) Money {
	return m + other
}

func (m Money) Mul(qty int32) Money {
	return m * Money(qty)
}
