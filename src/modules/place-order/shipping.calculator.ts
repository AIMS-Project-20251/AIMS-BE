
/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: none (pure utility) but used by `PlaceOrderService`
* - Reason: Static utility that calculates shipping purely from input values; no dependencies on external state or classes.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: `calculate` method
* - Reason: The class implements a single, focused function (shipping fee calculation), with all internal logic directly contributing to that calculation.
* ---------------------------------------------------------
*/

export class ShippingCalculator {
  static calculate(weightKg: number, city: string, subtotal: number): number {
    let fee = 0;
    const isMajorCity = ['Hanoi', 'Ho Chi Minh City', 'Ha Noi', 'Ho Chi Minh'].includes(city);

    if (isMajorCity) {
      if (weightKg <= 3) {
        fee = 22000;
      } else {
        fee = 22000;
        const extra = Math.ceil((weightKg - 3) / 0.5);
        fee += extra * 2500;
      }
    } else {
      if (weightKg <= 0.5) {
        fee = 30000;
      } else {
        fee = 30000;
        const extra = Math.ceil((weightKg - 0.5) / 0.5);
        fee += extra * 2500;
      }
    }

    if (subtotal > 100000) {
      fee = fee - 25000;
      if (fee < 0) fee = 0;
    }

    return fee;
  }
}
