
import { neon } from "@neondatabase/serverless";

/*export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    // Query to select all users
    const response = await sql`SELECT * FROM users;`;

    // Return the users in the response
    return new Response(JSON.stringify({ data: response }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
} */

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerk_id");

    // If clerk_id is provided, fetch a specific user by clerk_id
    if (clerkId) {
      const response = await sql`
        SELECT * FROM users WHERE clerk_id = ${clerkId};
      `;
      if (response.length === 0) {
        return Response.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      return new Response(JSON.stringify({ data: response[0] }), {
        status: 200,
      });
    }

    // Query to select all users if clerk_id is not provided
    const response = await sql`SELECT * FROM users;`;

    return new Response(JSON.stringify({ data: response }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { name, email, clerkId } = await request.json();

    if (!name || !email || !clerkId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const response = await sql`
      INSERT INTO users (
        name, 
        email, 
        clerk_id
      ) 
      VALUES (
        ${name}, 
        ${email},
        ${clerkId}
     );`;

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

