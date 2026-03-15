import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const FINN_API_URL = 'https://www.finn.no/api/search-qf'
const FINN_ORG_ID = '3366665'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FinnCar {
  id: string
  heading: string
  image: {
    url: string
    width: number
    height: number
  }
  price: {
    amount: number
    currency_code: string
  }
  year: number
  mileage: number
  make: string
  model: string
  model_specification?: string
  transmission: string
  fuel: string
  canonical_url: string
  location?: string
  warranty_duration?: number
}

interface TransformedCar {
  id: string
  title: string
  subtitle: string
  image: string
  price: number
  priceFormatted: string
  year: number
  mileage: number
  mileageFormatted: string
  make: string
  model: string
  transmission: string
  fuel: string
  url: string
  location: string
  warranty: number | null
}

function transformCar(car: FinnCar): TransformedCar {
  return {
    id: car.id,
    title: car.heading,
    subtitle: car.model_specification || `${car.make} ${car.model}`,
    image: car.image?.url || '',
    price: car.price?.amount || 0,
    priceFormatted: new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      maximumFractionDigits: 0,
    }).format(car.price?.amount || 0),
    year: car.year,
    mileage: car.mileage,
    mileageFormatted: new Intl.NumberFormat('nb-NO').format(car.mileage) + ' km',
    make: car.make,
    model: car.model,
    transmission: car.transmission,
    fuel: car.fuel,
    url: car.canonical_url,
    location: car.location || 'Kongsberg',
    warranty: car.warranty_duration || null,
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(FINN_API_URL)
    url.searchParams.set('searchkey', 'SEARCH_ID_CAR_USED')
    url.searchParams.set('orgId', FINN_ORG_ID)
    url.searchParams.set('vertical', 'car')

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; STOLLEsportsenter/1.0)',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Finn API returned ${response.status}`)
    }

    const data = await response.json()
    const cars = (data.docs || []).map(transformCar)

    return new Response(
      JSON.stringify({
        success: true,
        count: cars.length,
        cars,
        fetchedAt: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      }
    )
  } catch (error) {
    console.error('Error fetching from Finn:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        cars: [],
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
