import { connectDB } from "@/lib/mongodb";
import { Pin } from "@/models";
import { NextResponse } from "next/server";

// =============================================================================
// POST Handler - Create a new pin
// =============================================================================

export async function POST(request: Request) {
  // Step-1 connect to database
  await connectDB();

  //Step-2 Parse JSON data from body
  //contains the pin data sent by the client via form (title, description, latitude, longitude..)

  const body = await request.json();

  try {
    //create a new pin in database using the data
    const pin = await Pin.create(body);

    //return success response as pin created ( error will be handled in catch)
    return NextResponse.json(
      { success: true, message: "Pin Created Successfully!", data: pin },
      { status: 201 }
    );
  } catch (error) {
    //If something went wrong return 500< for internal server error

    console.error("Unexpected error occured while parsing body data:(", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create a pin",
        message: "An Error Occurred while creating the pin. Please try again",
      },
      {
        status: 500,
      }
    );
  }
}

// =============================================================================
// GET Handler - Get Nearby Pin based on the location
// =============================================================================

export async function GET(request: Request) {
  //Step-1 Establish connection
  await connectDB();

  //Step-2 extract query param from the url for example Example URL: /api/pins?lat=40.7128&lng=-74.0060&maxDistance=1000

  const { searchParams } = new URL(request.url);

  //Parse the lat and long query into a number (conversion)

  const lat = parseFloat(searchParams.get("lat")!);
  const lng = parseFloat(searchParams.get("lng")!);

  //validate coordinates

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid coordinates",
        message: "Please provide valid latitude and longitude values",
      },
      { status: 400 }
    );
  }

  //parse max distance too
  const maxDistance = parseInt(searchParams.get("maxDistance")!) || 5000;

  //Now we have lat and lng also the max distance so we can find the nearby pins now

  try {
    const pins = await Pin.find({
      location: {
        //$near geospatial operator in mongodb to find nearby documents
        $near: {
          //define center point
          $geometry: {
            type: "Point", //GEOJson point type
            coordinates: [lng, lat], // must order
          },
          //Max distance in meter from the centeral point

          $maxDistance: maxDistance,
        },
      },

      // return status
      status: "active",
    });

    //Return the found pins as json with success message
    return NextResponse.json({
      success: true,
      message: `Found ${pins.length} pins within the ${maxDistance}m of you location`,
      data: pins,
    });
  } catch (error) {
    console.error(
      "Unexpected error while fetching pins within maxDistance",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pins",
        message:
          "An error occurred while searching the pins. Please check your location and try again",
      },
      {
        status: 500,
      }
    );
  }
}
