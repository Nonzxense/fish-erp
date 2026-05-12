package common

import "math"

type Money int64 // สตางค์

func NewMoney(v float64) Money {
	return Money(math.Round(v * 100))
}

func (m Money) Add(other Money) Money {
	return m + other
}

func (m Money) Mul(v any) Money {
	switch n := v.(type) {
	case int:
		return m * Money(n)
	case int8:
		return m * Money(n)
	case int16:
		return m * Money(n)
	case int32:
		return m * Money(n)
	case int64:
		return m * Money(n)

	case uint:
		return m * Money(n)
	case uint8:
		return m * Money(n)
	case uint16:
		return m * Money(n)
	case uint32:
		return m * Money(n)
	case uint64:
		return m * Money(n)

	case float32:
		return Money(math.Round(float64(m) * float64(n)))

	case float64:
		return Money(math.Round(float64(m) * n))

	default:
		panic("unsupported type for Money.Mul")
	}
}
