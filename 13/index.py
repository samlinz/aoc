# Failed attempt at creating an algebraic solution, ignore

from dataclasses import dataclass
from math import gcd


@dataclass
class Machine:
    delta_x_a: int
    delta_y_a: int
    delta_x_b: int
    delta_y_b: int
    prize_x: int
    prize_y: int


def extended_gcd(a, b):
    # Base Case
    if a == 0:
        return b, 0, 1

    gcd, x1, y1 = extended_gcd(b % a, a)

    x = y1 - (b//a) * x1
    y = x1

    return gcd, x, y


def solve_claw_machine(machine: Machine):
    g_x, x_a, x_b = extended_gcd(machine.delta_x_a, machine.delta_x_b)
    if machine.prize_x % g_x != 0:
        return None
    scale_x = machine.prize_x // g_x
    x_a_2 = x_a * scale_x
    x_b_2 = x_b * scale_x

    print(f"X: {g_x}, {x_a}, {x_b} {scale_x}")

    # Doesn't work :deadge:, egcd results in negative coefficients


machines: list[Machine] = [
    Machine(94, 34, 22, 67, 8400, 5400),
    Machine(26, 66, 67, 21, 12748, 12176),
    Machine(17, 86, 84, 37, 7870, 6450),
    Machine(69, 23, 27, 71, 18641, 10279),
]


for i, machine in enumerate(machines):
    result = solve_claw_machine(machine)
    if result:
        a1, a2, tokens = result
        print(f"Machine {i + 1}: a1 = {a1}, a2 = {a2}, Tokens = {tokens}")
    else:
        print(f"Machine {i + 1}: No solution")
