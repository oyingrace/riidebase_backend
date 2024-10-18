
import { neon } from "@neondatabase/serverless";

export async function GET(request: any, context: any) {
  const id = request.params?.id || request.query?.id;

  console.log(`Received request for user ID: ${id}`);

  if (!id) {
    console.log('Missing ID in request');
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Ensure the id is in the correct format
  const userId = id.startsWith('user_') ? id : `user_${id}`;

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    console.log(`Executing SQL query for user ID: ${userId}`);
    const result = await sql`
        SELECT
            rides.ride_id,
            rides.origin_address,
            rides.destination_address,
            rides.origin_latitude,
            rides.origin_longitude,
            rides.destination_latitude,
            rides.destination_longitude,
            rides.ride_time,
            rides.fare_price,
            rides.payment_status,
            rides.created_at,
            json_build_object(
                'driver_id', drivers.id,
                'first_name', drivers.first_name,
                'last_name', drivers.last_name,
                'profile_image_url', drivers.profile_image_url,
                'car_image_url', drivers.car_image_url,
                'car_seats', drivers.car_seats,
                'rating', drivers.rating
            ) AS driver 
        FROM 
            rides
        INNER JOIN
            drivers ON rides.driver_id = drivers.id
        WHERE 
            rides.user_id = ${userId}
        ORDER BY 
            rides.created_at DESC;
    `;

    console.log(`Query result:`, result);

    return new Response(JSON.stringify({ data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error fetching recent rides:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}