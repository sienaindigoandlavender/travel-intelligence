export type Riad = {
  id: string;
  name: string;
  externalId: string;
  tripadvisorUrl: string;
  lng: number;
  lat: number;
};

export const MARRAKECH_CENTER: { lng: number; lat: number; zoom: number } = {
  lng: -7.9811,
  lat: 31.6295,
  zoom: 14,
};

export const riads: Riad[] = [
  {
    id: "86b9ddb3-d42f-4d7e-a1a5-233ec2f2ef55",
    name: "Riad Amirat Al Jamal",
    externalId: "858018",
    tripadvisorUrl:
      "https://www.tripadvisor.com/Hotel_Review-g293734-d858018-Reviews-Riad_Amirat_Al_Jamal-Marrakech_Marrakech_Safi.html",
    lng: -7.9895,
    lat: 31.629,
  },
  {
    id: "13fdcfec-2109-4e79-8fdb-d19399397712",
    name: "Riad BB Marrakech",
    externalId: "1785056",
    tripadvisorUrl:
      "https://www.tripadvisor.com/Hotel_Review-g293734-d1785056-Reviews-Riad_Bb_Marrakech-Marrakech_Marrakech_Safi.html",
    lng: -7.9835,
    lat: 31.631,
  },
  {
    id: "0581e023-1ea7-470b-992c-25241b0ca2ef",
    name: "Riad di Siena",
    externalId: "27426915",
    tripadvisorUrl:
      "https://www.tripadvisor.com/Hotel_Review-g293734-d27426915-Reviews-Riad_di_Siena-Marrakech_Marrakech_Safi.html",
    lng: -7.981,
    lat: 31.6275,
  },
  {
    id: "07a4cce2-aea9-468d-b94e-d401c5d8ee9b",
    name: "Riad Kitula",
    externalId: "27701674",
    tripadvisorUrl:
      "https://www.tripadvisor.com/Hotel_Review-g293734-d27701674-Reviews-Riad_Kitula-Marrakech_Marrakech_Safi.html",
    lng: -7.986,
    lat: 31.633,
  },
  {
    id: "09cc4d06-6619-4797-aab9-03e8cbe281b9",
    name: "Riad Zi",
    externalId: "652849",
    tripadvisorUrl:
      "https://www.tripadvisor.com/Hotel_Review-g293734-d652849-Reviews-Riad_Zi-Marrakech_Marrakech_Safi.html",
    lng: -7.9785,
    lat: 31.6285,
  },
];

export async function getRiads(): Promise<Riad[]> {
  return riads;
}
