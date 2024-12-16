# Even more failed attempt at using genetic algorithms, ignore even harder

from dataclasses import dataclass
import os
import random
import re
from typing import Tuple
from deap import base, creator, tools, algorithms


type Individual = Tuple[int, int]


@dataclass
class Machine:
    delta_x_a: int
    delta_y_a: int
    delta_x_b: int
    delta_y_b: int
    prize_x: int
    prize_y: int
    cost_a: int
    cost_b: int


# machines: list[Machine] = [
#     Machine(94, 34, 22, 67, 8400, 5400, 3, 1),
#     Machine(26, 66, 67, 21, 12748, 12176, 3, 1),
#     Machine(17, 86, 84, 37, 7870, 6450, 3, 1),
#     Machine(69, 23, 27, 71, 18641, 10279, 3, 1),
# ]


def read_machines():
    d = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(d, "input")) as f:
        machines = []
        for line in f:
            if (len(line) == 0):
                continue
            regex = re.compile("(\\d+)")
            values = regex.findall(line)
            if (line.startswith("Button A")):
                delta_x_a = int(values[0])
                delta_y_a = int(values[1])
            elif (line.startswith("Button B")):
                delta_x_b = int(values[0])
                delta_y_b = int(values[1])
            elif (line.startswith("Prize")):
                prize_x = int(values[0])
                prize_y = int(values[1])
                machines.append(Machine(delta_x_a, delta_y_a,
                                delta_x_b, delta_y_b, prize_x, prize_y, 3, 1))
    return machines


def resolve_ind(ind: Individual, machine: Machine):
    a1, a2 = ind

    x_constraint = a1 * machine.delta_x_a + a2 * machine.delta_x_b - machine.prize_x
    y_constraint = a1 * machine.delta_y_a + a2 * machine.delta_y_b - machine.prize_y

    return x_constraint, y_constraint


def fitness_function(individual: Individual, machine: Machine):
    a1, a2 = individual
    x_constraint, y_constraint = resolve_ind(individual, machine)
    penalty = abs(x_constraint) + abs(y_constraint)
    cost = abs(a1) * machine.cost_a + abs(a2) * machine.cost_b
    return cost + 1000 * penalty,


def mutate_ind(ind: Individual):
    index = random.randint(0, 1)
    ind[index] += max(0, random.randint(-10, 10))
    return ind,


def mate(ind1: Individual, ind2: Individual):
    size = min(len(ind1), len(ind2))
    for i in range(size):
        if random.random() < 0.5:
            ind1[i], ind2[i] = ind2[i], ind1[i]
    return ind1, ind2


def solve_machine_with_deap(machine):
    creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
    creator.create("Individual", list, fitness=creator.FitnessMin)

    toolbox = base.Toolbox()
    toolbox.register("attr_int", random.randint, 0,
                     1000)  # Random button presses
    toolbox.register("individual", tools.initRepeat,
                     creator.Individual, toolbox.attr_int, n=2)
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)

    toolbox.register("evaluate", fitness_function, machine=machine)
    toolbox.register("mate", mate)
    toolbox.register("mutate", mutate_ind)
    toolbox.register("select", tools.selTournament, tournsize=3)

    population = toolbox.population(n=1000)

    result = algorithms.eaSimple(
        population, toolbox, cxpb=0.2, mutpb=0.8, ngen=100, verbose=False)

    best_individual = tools.selBest(population, k=1)[0]
    return best_individual, best_individual.fitness.values[0]


machines = read_machines()

total_cost = 0
for i, machine in enumerate(machines):
    solution, fitness = solve_machine_with_deap(machine)
    a1, a2 = solution

    x_constraint, y_constraint = resolve_ind(solution, machine)
    if x_constraint != 0 or y_constraint != 0:
        print(f"Machine {i + 1}: No solution")
        continue

    cost = a1 * machine.cost_a + a2 * machine.cost_b
    total_cost += cost

    print(f"Machine {i + 1}: a1 = {a1}, a2 = {a2}, Cost = {fitness:.2f}")

print(f"Total cost: {total_cost}")
