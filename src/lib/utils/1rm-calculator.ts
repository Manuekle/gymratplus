/**
 * Calculates the One Repetition Maximum (1RM) using the Brzycki Formula.
 * Formula: weight / (1.0278 - 0.0278 * reps)
 * 
 * @param weight - The weight used in the set (kg/lbs)
 * @param reps - The number of repetitions performed
 * @returns The estimated 1RM, rounded to 1 decimal place. Returns 0 if inputs are invalid.
 */
export function calculate1RM(weight: number, reps: number): number {
    if (weight <= 0 || reps <= 0) return 0;
    if (reps === 1) return weight;

    // Brzycki Formula
    const oneRm = weight / (1.0278 - 0.0278 * reps);

    // Round to nearest 0.5 or 1 for standard gym plates? 
    // Let's stick to 1 decimal place for precision first
    return Math.round(oneRm * 10) / 10;
}

/**
 * Calculates total volume for an exercise
 * Formula: weight * reps * sets
 * 
 * @param sets - Array of sets with weight and reps
 * @returns Total volume
 */
export function calculateVolume(sets: { weight: number | null; reps: number | null, completed: boolean }[]): number {
    return sets.reduce((volume, set) => {
        if (set.completed && set.weight && set.reps) {
            return volume + (set.weight * set.reps);
        }
        return volume;
    }, 0);
}
