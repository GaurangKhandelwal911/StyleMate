import { WeatherCondition } from '@/types';

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number; // in Celsius
  description: string;
  location: string;
}

export class WeatherService {
  public static async getCurrentWeather(city: string = 'Mumbai'): Promise<WeatherData> {
    // Current month heuristic for local context or simulated live forecast
    const currentMonth = new Date().getMonth(); // 0 - 11
    // Oct is autumn/mild-warm
    let condition: WeatherCondition = 'Mild';
    let temp = 24;
    let description = 'Clear skies with pleasant mild breeze';

    if (currentMonth >= 3 && currentMonth <= 5) {
      condition = 'Hot';
      temp = 34;
      description = 'Warm sunshine with dry heat';
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      condition = 'Rainy';
      temp = 27;
      description = 'Overcast with periodic showers';
    } else if (currentMonth >= 11 || currentMonth <= 1) {
      condition = 'Cold';
      temp = 16;
      description = 'Crisp, chilly winter air';
    } else {
      condition = 'Mild';
      temp = 25;
      description = 'Mild and comfortable outdoor temperature';
    }

    return {
      condition,
      temperature: temp,
      description,
      location: city,
    };
  }
}
