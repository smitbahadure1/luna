import { addDays, differenceInDays, format, startOfDay, parseISO } from 'date-fns';

export interface CycleData {
    startDate: string; // ISO string YYYY-MM-DD
    periodLength: number;
    cycleLength: number;
}

// Default averages
export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

export const calculateNextPeriod = (startDate: string, cycleLength: number = DEFAULT_CYCLE_LENGTH) => {
    const start = parseISO(startDate);
    return format(addDays(start, cycleLength), 'yyyy-MM-dd');
};

export const calculateFertileWindow = (startDate: string, cycleLength: number = DEFAULT_CYCLE_LENGTH) => {
    // Ovulation is roughly 14 days before the NEXT period
    // So for a 28 day cycle, ovulation is day 14.
    // Fertile window is usually 5 days before ovulation + ovulation day.
    const start = parseISO(startDate);
    const ovulationDay = cycleLength - 14;

    const fertileStartDay = ovulationDay - 5;
    const fertileEndDay = ovulationDay; // inclusive

    const fertileStartDate = addDays(start, fertileStartDay);
    const fertileEndDate = addDays(start, fertileEndDay);

    return {
        start: format(fertileStartDate, 'yyyy-MM-dd'),
        end: format(fertileEndDate, 'yyyy-MM-dd'),
    };
};

export const getCurrentCycleDay = (startDate: string) => {
    const start = startOfDay(parseISO(startDate));
    const today = startOfDay(new Date());

    // differenceInDays returns 0 if same day, so add 1 for "Day 1"
    return differenceInDays(today, start) + 1;
};

export const getProjectedCycles = (lastPeriodDate: string, count: number = 3, cycleLength: number = DEFAULT_CYCLE_LENGTH, periodLength: number = DEFAULT_PERIOD_LENGTH) => {
    let currentStart = parseISO(lastPeriodDate);
    const projections = [];

    for (let i = 0; i < count; i++) {
        // Calculate next cycle start (add cycleLength to current start)
        // NOTE: The first iteration shouldn't be the LAST period, but the NEXT one if we are projecting future.
        // If we want to include the current cycle in markings, we start from lastPeriodDate.

        let cycleStart = i === 0 ? currentStart : addDays(currentStart, cycleLength);

        // Update currentStart for next iteration
        if (i !== 0) {
            currentStart = cycleStart;
        }

        const fertile = calculateFertileWindow(format(cycleStart, 'yyyy-MM-dd'), cycleLength);
        const periodEnd = addDays(cycleStart, periodLength - 1);

        projections.push({
            startDate: format(cycleStart, 'yyyy-MM-dd'),
            endDate: format(periodEnd, 'yyyy-MM-dd'),
            fertileStart: fertile.start,
            fertileEnd: fertile.end
        });
    }
    return projections;
}
