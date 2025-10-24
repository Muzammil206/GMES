export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: "Missing lat/lon parameters" }), { status: 400 });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "floodmangement/1.0 (ismailmuzammil.com)" //
      }
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();

    if (data && data.address) {
      return new Response(JSON.stringify({
        address: data.display_name,
        city: data.address.city || data.address.town || data.address.village,
        local_government: data.address.county || data.address.district,
        state: data.address.state,
        country: data.address.country
      }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Location not found" }), { status: 404 });

  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
