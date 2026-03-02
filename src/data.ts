export interface AtlasEntry {
  id: string;
  ageMonths: number;
  labelEn: string;
  labelVi: string;
  gender: 'boy' | 'girl';
  page: number;
}

export const ATLAS_DATA: AtlasEntry[] = [
  // BOYS
  { id: 'A1', ageMonths: 8, labelEn: '8 months', labelVi: '8 tháng', gender: 'boy', page: 3 },
  { id: 'A2', ageMonths: 10, labelEn: '10 months', labelVi: '10 tháng', gender: 'boy', page: 4 },
  { id: 'A3', ageMonths: 12, labelEn: '12 months', labelVi: '12 tháng', gender: 'boy', page: 5 },
  { id: 'A4', ageMonths: 14, labelEn: '14 months', labelVi: '14 tháng', gender: 'boy', page: 6 },
  { id: 'A5', ageMonths: 16, labelEn: '16 months', labelVi: '16 tháng', gender: 'boy', page: 7 },
  { id: 'A6', ageMonths: 18, labelEn: '18 months', labelVi: '18 tháng', gender: 'boy', page: 8 },
  { id: 'A7', ageMonths: 20, labelEn: '20 months', labelVi: '20 tháng', gender: 'boy', page: 9 },
  { id: 'A8', ageMonths: 24, labelEn: '2 years', labelVi: '2 tuổi', gender: 'boy', page: 10 },
  { id: 'A9', ageMonths: 28, labelEn: '28 months', labelVi: '28 tháng', gender: 'boy', page: 11 },
  { id: 'A10', ageMonths: 30, labelEn: '2.5 years', labelVi: '2.5 tuổi', gender: 'boy', page: 12 },
  { id: 'A11', ageMonths: 36, labelEn: '3 years', labelVi: '3 tuổi', gender: 'boy', page: 13 },
  { id: 'A12', ageMonths: 42, labelEn: '3.5 years', labelVi: '3.5 tuổi', gender: 'boy', page: 14 },
  { id: 'A13', ageMonths: 48, labelEn: '4 years', labelVi: '4 tuổi', gender: 'boy', page: 15 },
  { id: 'A14', ageMonths: 54, labelEn: '4.5 years', labelVi: '4.5 tuổi', gender: 'boy', page: 16 },
  { id: 'A15', ageMonths: 60, labelEn: '5 years', labelVi: '5 tuổi', gender: 'boy', page: 17 },
  { id: 'A16', ageMonths: 66, labelEn: '5.5 years', labelVi: '5.5 tuổi', gender: 'boy', page: 18 },
  { id: 'A17', ageMonths: 72, labelEn: '6 years', labelVi: '6 tuổi', gender: 'boy', page: 19 },
  { id: 'A18', ageMonths: 84, labelEn: '7 years', labelVi: '7 tuổi', gender: 'boy', page: 20 },
  { id: 'A19', ageMonths: 96, labelEn: '8 years', labelVi: '8 tuổi', gender: 'boy', page: 21 },
  { id: 'A20', ageMonths: 108, labelEn: '9 years', labelVi: '9 tuổi', gender: 'boy', page: 22 },
  { id: 'A21', ageMonths: 120, labelEn: '10 years', labelVi: '10 tuổi', gender: 'boy', page: 23 },
  { id: 'A22', ageMonths: 132, labelEn: '11 years', labelVi: '11 tuổi', gender: 'boy', page: 24 },
  { id: 'A23', ageMonths: 144, labelEn: '12 years', labelVi: '12 tuổi', gender: 'boy', page: 25 },
  { id: 'A24', ageMonths: 156, labelEn: '13 years', labelVi: '13 tuổi', gender: 'boy', page: 26 },
  { id: 'A25', ageMonths: 168, labelEn: '14 years', labelVi: '14 tuổi', gender: 'boy', page: 27 },
  { id: 'A26', ageMonths: 180, labelEn: '15 years', labelVi: '15 tuổi', gender: 'boy', page: 28 },
  { id: 'A27', ageMonths: 192, labelEn: '16 years', labelVi: '16 tuổi', gender: 'boy', page: 29 },
  { id: 'A28', ageMonths: 204, labelEn: '17 years', labelVi: '17 tuổi', gender: 'boy', page: 30 },
  { id: 'A29', ageMonths: 216, labelEn: '18 years', labelVi: '18 tuổi', gender: 'boy', page: 31 },

  // GIRLS
  { id: 'A30', ageMonths: 8, labelEn: '8 months', labelVi: '8 tháng', gender: 'girl', page: 32 },
  { id: 'A31', ageMonths: 10, labelEn: '10 months', labelVi: '10 tháng', gender: 'girl', page: 33 },
  { id: 'A32', ageMonths: 12, labelEn: '12 months', labelVi: '12 tháng', gender: 'girl', page: 34 },
  { id: 'A33', ageMonths: 14, labelEn: '14 months', labelVi: '14 tháng', gender: 'girl', page: 35 },
  { id: 'A34', ageMonths: 16, labelEn: '16 months', labelVi: '16 tháng', gender: 'girl', page: 36 },
  { id: 'A35', ageMonths: 18, labelEn: '18 months', labelVi: '18 tháng', gender: 'girl', page: 37 },
  { id: 'A36', ageMonths: 20, labelEn: '20 months', labelVi: '20 tháng', gender: 'girl', page: 38 },
  { id: 'A37', ageMonths: 24, labelEn: '2 years', labelVi: '2 tuổi', gender: 'girl', page: 39 },
  { id: 'A38', ageMonths: 28, labelEn: '28 months', labelVi: '28 tháng', gender: 'girl', page: 40 },
  { id: 'A39', ageMonths: 30, labelEn: '2.5 years', labelVi: '2.5 tuổi', gender: 'girl', page: 41 },
  { id: 'A40', ageMonths: 36, labelEn: '3 years', labelVi: '3 tuổi', gender: 'girl', page: 42 },
  { id: 'A41', ageMonths: 42, labelEn: '3.5 years', labelVi: '3.5 tuổi', gender: 'girl', page: 43 },
  { id: 'A42', ageMonths: 48, labelEn: '4 years', labelVi: '4 tuổi', gender: 'girl', page: 44 },
  { id: 'A43', ageMonths: 54, labelEn: '4.5 years', labelVi: '4.5 tuổi', gender: 'girl', page: 45 },
  { id: 'A44', ageMonths: 60, labelEn: '5 years', labelVi: '5 tuổi', gender: 'girl', page: 46 },
  { id: 'A45', ageMonths: 66, labelEn: '5.5 years', labelVi: '5.5 tuổi', gender: 'girl', page: 47 },
  { id: 'A46', ageMonths: 72, labelEn: '6 years', labelVi: '6 tuổi', gender: 'girl', page: 48 },
  { id: 'A47', ageMonths: 84, labelEn: '7 years', labelVi: '7 tuổi', gender: 'girl', page: 49 },
  { id: 'A48', ageMonths: 96, labelEn: '8 years', labelVi: '8 tuổi', gender: 'girl', page: 50 },
  { id: 'A49', ageMonths: 108, labelEn: '9 years', labelVi: '9 tuổi', gender: 'girl', page: 51 },
  { id: 'A50', ageMonths: 120, labelEn: '10 years', labelVi: '10 tuổi', gender: 'girl', page: 52 },
  { id: 'A51', ageMonths: 132, labelEn: '11 years', labelVi: '11 tuổi', gender: 'girl', page: 53 },
  { id: 'A52', ageMonths: 144, labelEn: '12 years', labelVi: '12 tuổi', gender: 'girl', page: 54 },
  { id: 'A53', ageMonths: 156, labelEn: '13 years', labelVi: '13 tuổi', gender: 'girl', page: 55 },
  { id: 'A54', ageMonths: 168, labelEn: '14 years', labelVi: '14 tuổi', gender: 'girl', page: 56 },
  { id: 'A55', ageMonths: 180, labelEn: '15 years', labelVi: '15 tuổi', gender: 'girl', page: 57 },
  { id: 'A56', ageMonths: 192, labelEn: '16 years', labelVi: '16 tuổi', gender: 'girl', page: 58 },
  { id: 'A57', ageMonths: 204, labelEn: '17 years', labelVi: '17 tuổi', gender: 'girl', page: 59 },
  { id: 'A58', ageMonths: 216, labelEn: '18 years', labelVi: '18 tuổi', gender: 'girl', page: 60 },
];
