import { get } from "lodash";
import { chargeFrequencyEnum } from "../ChargeFrequencyEnum";
import { OldDayEnum } from "../OldDayEnum";

const DAY_NAME_TO_INDEX: Record<string, number> = {
    [OldDayEnum.SUNDAY]: 0,
    [OldDayEnum.MONDAY]: 1,
    [OldDayEnum.TUESDAY]: 2,
    [OldDayEnum.WEDNESDAY]: 3,
    [OldDayEnum.THURSDAY]: 4,
    [OldDayEnum.FRIDAY]: 5,
    [OldDayEnum.SATURDAY]: 6,
};

const getStartOfDay = (referenceDate: Date): Date => {
    const start = new Date(referenceDate);
    start.setHours(0, 0, 0, 0);
    return start;
};

// Retrocede desde referenceDate hasta la última ocurrencia (incluyendo hoy) del día de la semana indicado
const getLastOccurrenceOfDay = (dayIndex: number, referenceDate: Date): Date => {
    const start = getStartOfDay(referenceDate);
    const diff = (start.getDay() - dayIndex + 7) % 7;
    start.setDate(start.getDate() - diff);
    return start;
};

// Avanza "periods" días de cobro a partir de startDate, sin contar los domingos
const addChargeDaysSkippingSunday = (startDate: Date, periods: number): Date => {
    const result = new Date(startDate);
    let remaining = periods;
    while (remaining > 0) {
        result.setDate(result.getDate() + 1);
        if (result.getDay() !== 0) { // 0 = domingo
            remaining--;
        }
    }
    return result;
};

export const ChargeFrequencyDateCatalog: Record<string, (chargeRules: {
    chargePeriods?: number,
    chargeDay?: string
}, referenceDate?: Date) => {
    startDateChargeConfig: Date,
    expirationDate: Date
}> = {
    [chargeFrequencyEnum.DAILY]: (chargeRules, referenceDate = new Date()) => {
        const chargePeriods: number = get(chargeRules, "chargePeriods", 1);
        const startDateChargeConfig = getStartOfDay(referenceDate);
        const expirationDate = addChargeDaysSkippingSunday(startDateChargeConfig, chargePeriods);

        return { startDateChargeConfig, expirationDate };
    },
    [chargeFrequencyEnum.WEEKLY]: (chargeRules, referenceDate = new Date()) => {
        const chargePeriods: number = get(chargeRules, "chargePeriods", 1);
        const chargeDay: string = get(chargeRules, "chargeDay", OldDayEnum.MONDAY);
        const dayIndex: number = DAY_NAME_TO_INDEX[chargeDay] ?? 1; // 1 = lunes, por si el valor no coincide con ningún día conocido
        const startDateChargeConfig = getLastOccurrenceOfDay(dayIndex, referenceDate);
        const expirationDate = new Date(startDateChargeConfig);
        expirationDate.setDate(expirationDate.getDate() + (chargePeriods * 7));

        return { startDateChargeConfig, expirationDate };
    },
};
