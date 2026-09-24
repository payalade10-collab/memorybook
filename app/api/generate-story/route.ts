import { NextResponse } from "next/server";

interface PhotoInput {
  id: string;
  url: string;
}

interface AnalyzedPhoto {
  id: string;
  caption: string;
  place: string;
  situation: string;
}

// Keep your currently working model for now.
const GEMINI_MODEL = "gemini-3.5-flash-lite";

const MAX_RETRIES = 3;

function getGeminiText(data: any): string {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.filter(
        (part: any) => typeof part.text === "string"
      )
      ?.map((part: any) => part.text)
      ?.join("") || ""
  );
}

function cleanJsonText(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/**
 * Wait helper for Gemini retry.
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Sends a request to Gemini.
 *
 * 503 errors are temporary, so we retry them.
 *
 * Other errors are returned immediately because retrying
 * things like an invalid API key will not help.
 */
async function callGemini(
  requestBody: any,
  apiKey: string
): Promise<any> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  let lastError = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `Gemini request attempt ${attempt}/${MAX_RETRIES}`
      );

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      console.log(
        "Gemini status:",
        response.status
      );

      if (response.ok) {
        try {
          return JSON.parse(responseText);
        } catch {
          throw new Error(
            "Gemini returned an invalid API response."
          );
        }
      }

      lastError = responseText;

      console.error(
        `Gemini API error (${response.status}):`,
        responseText
      );

      /*
       * 503 = temporary service overload/unavailability.
       *
       * Retry after waiting.
       */
      if (response.status === 503) {
        if (attempt < MAX_RETRIES) {
          const delay =
            attempt === 1
              ? 2000
              : attempt === 2
              ? 5000
              : 9000;

          console.log(
            `Gemini temporarily unavailable. Retrying in ${delay}ms...`
          );

          await wait(delay);
          continue;
        }
      }

      /*
       * 429 = rate limit.
       *
       * Also worth retrying.
       */
      if (response.status === 429) {
        if (attempt < MAX_RETRIES) {
          const delay =
            attempt === 1
              ? 3000
              : attempt === 2
              ? 7000
              : 12000;

          console.log(
            `Gemini rate limited. Retrying in ${delay}ms...`
          );

          await wait(delay);
          continue;
        }
      }

      /*
       * Other errors should not be retried.
       */
      throw new Error(
        `Gemini API failed with status ${response.status}: ${responseText}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      lastError = errorMessage;

      /*
       * If this was already our explicit API error,
       * don't blindly retry it.
       */
      if (
        !errorMessage.includes("status 503") &&
        !errorMessage.includes("status 429")
      ) {
        throw error;
      }

      if (attempt < MAX_RETRIES) {
        const delay =
          attempt === 1
            ? 2000
            : attempt === 2
            ? 5000
            : 9000;

        console.log(
          `Temporary Gemini error. Retrying in ${delay}ms...`
        );

        await wait(delay);
      }
    }
  }

  throw new Error(
    `Gemini temporarily unavailable after ${MAX_RETRIES} attempts. ${lastError}`
  );
}

async function analyzePhoto(
  photo: PhotoInput,
  apiKey: string
): Promise<AnalyzedPhoto> {
  try {
    console.log(
      "================================="
    );

    console.log(
      "Analyzing photo:",
      photo.id
    );

    /*
     * Make sure the frontend actually sent
     * Base64 image data.
     */
    if (
      !photo.url ||
      !photo.url.startsWith("data:image/")
    ) {
      throw new Error(
        "Photo does not contain valid Base64 image data."
      );
    }

    /*
     * Extract MIME type and Base64 data.
     *
     * Examples:
     *
     * data:image/jpeg;base64,AAAA...
     * data:image/png;base64,AAAA...
     * data:image/webp;base64,AAAA...
     */
    const match = photo.url.match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
    );

    if (!match) {
      throw new Error(
        "Could not extract image MIME type and Base64 data."
      );
    }

    const mimeType = match[1];
    const base64Data = match[2];

    console.log(
      "Image type:",
      mimeType
    );

    console.log(
      "Base64 length:",
      base64Data.length
    );

    const prompt = `
You are the visual intelligence system for a premium digital memory album.

Look carefully at the EXACT photograph provided with this request.

Analyze what is actually visible in the photograph.

Your job is to determine three things.

1. PLACE

Identify the visible place, landmark, environment, or setting.

Examples:

- Gateway of India
- Marine Drive
- beach
- mountain viewpoint
- college campus
- restaurant
- temple
- garden
- wedding venue
- home
- airport
- railway station
- city street
- park
- tourist attraction

If a famous landmark is clearly recognizable, identify its actual name.

If the exact place cannot be identified, describe the visible setting instead.

NEVER invent an exact location.

2. SITUATION

Understand what is happening in the photograph.

Examples:

- friends enjoying a trip
- family gathering
- birthday celebration
- sightseeing
- graduation
- wedding celebration
- eating together
- relaxing at the beach
- posing for a photograph
- exploring a city
- enjoying nature
- studying
- travelling
- visiting a landmark
- attending an event

Only describe what can reasonably be understood from the photograph.

NEVER invent relationships, names, events, or facts that cannot be seen.

3. CAPTION

Create ONE beautiful, natural caption specifically for THIS photograph.

The caption must be based on:

PLACE + SITUATION + visible details.

The caption must be between 8 and 25 words.

The caption should sound like something a real person would put under their favourite photograph in a beautiful memory album.

IMPORTANT:

The caption MUST be specific to this photograph.

Do NOT write generic captions such as:

"A beautiful moment worth remembering."

"A special memory."

"Making memories."

"A day to remember."

Do NOT use the same caption structure for every photograph.

If a recognizable landmark is visible, mention it naturally.

If the exact place is unknown, mention the visible setting instead.

If people are doing something identifiable, mention that situation.

If it is a travel photograph, make it feel like a travel memory.

If it is a celebration, make it feel like a celebration.

If it is nature, describe the scenery naturally.

If it is food, describe the food or dining situation.

If it is a group photograph, describe the visible group moment.

If it is architecture or landmark photography, focus on the place.

Never invent:

- names
- dates
- relationships
- exact locations
- events
- facts that are not visible

Examples:

Gateway of India:

"Standing beside Mumbai's iconic Gateway of India, capturing a beautiful moment from the city adventure."

Beach:

"An easygoing evening by the sea, filled with laughter, friendship, and the sound of waves."

Mountain:

"Taking in peaceful mountain views and enjoying a quiet escape surrounded by nature."

Birthday:

"Celebrating another beautiful year together, surrounded by laughter, cake, and the people who make it special."

College:

"College memories, new experiences, and familiar faces coming together for a memorable day."

Restaurant:

"Good food, warm conversations, and a relaxed evening shared around the table."

Return ONLY valid JSON in exactly this structure:

{
  "place": "specific visible place or setting",
  "situation": "what is happening",
  "caption": "specific caption for this exact photograph"
}
`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    };

    const data = await callGemini(
      requestBody,
      apiKey
    );

    console.log(
      "Gemini model:",
      GEMINI_MODEL
    );

    const outputText =
      getGeminiText(data);

    console.log(
      "Gemini output:",
      outputText
    );

    if (!outputText) {
      throw new Error(
        "Gemini returned no analysis."
      );
    }

    let parsed: any;

    try {
      const cleaned =
        cleanJsonText(outputText);

      parsed = JSON.parse(cleaned);
    } catch {
      console.error(
        "Gemini returned invalid JSON:",
        outputText
      );

      throw new Error(
        "Gemini returned invalid caption JSON."
      );
    }

    const place =
      typeof parsed.place === "string" &&
      parsed.place.trim()
        ? parsed.place.trim()
        : "Location unavailable";

    const situation =
      typeof parsed.situation === "string" &&
      parsed.situation.trim()
        ? parsed.situation.trim()
        : "A memorable moment";

    const caption =
      typeof parsed.caption === "string" &&
      parsed.caption.trim()
        ? parsed.caption.trim()
        : "";

    if (!caption) {
      throw new Error(
        "Gemini did not generate a caption."
      );
    }

    console.log(
      "AI PLACE:",
      place
    );

    console.log(
      "AI SITUATION:",
      situation
    );

    console.log(
      "AI CAPTION:",
      caption
    );

    console.log(
      "================================="
    );

    return {
      id: photo.id,
      place,
      situation,
      caption,
    };
  } catch (error) {
    console.error(
      `PHOTO ANALYSIS FAILED FOR ${photo.id}:`,
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    /*
     * Do NOT crash the entire album if
     * one photograph fails.
     */
    return {
      id: photo.id,
      place: "AI analysis failed",
      situation: errorMessage,
      caption: `AI error: ${errorMessage}`,
    };
  }
}

async function createAlbumIntroduction(
  title: string,
  photos: AnalyzedPhoto[],
  apiKey: string
): Promise<string> {
  try {
    const photoInformation =
      photos
        .map(
          (photo, index) => `
Photo ${index + 1}

Place:
${photo.place}

Situation:
${photo.situation}

Caption:
${photo.caption}
`
        )
        .join("\n");

    const prompt = `
Create a warm introduction for a digital memory album.

Album title:

${title}

Photo information:

${photoInformation}

Write exactly 2 short paragraphs.

The introduction should feel connected to the actual photographs.

Rules:

- Do not invent facts.
- Do not mention AI.
- Do not repeat the captions word-for-word.
- Mention the overall feeling of the memories.
- Keep it natural and emotional.
- Make it suitable for a personal photo album.

Return only the introduction.
`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
      },
    };

    const data = await callGemini(
      requestBody,
      apiKey
    );

    return getGeminiText(data).trim();
  } catch (error) {
    console.error(
      "Album introduction failed:",
      error
    );

    return "";
  }
}

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const photos: PhotoInput[] =
      Array.isArray(body.photos)
        ? body.photos
        : [];

    const title =
      typeof body.title === "string" &&
      body.title.trim()
        ? body.title.trim()
        : "My Memory Album";

    if (photos.length === 0) {
      return NextResponse.json(
        {
          error:
            "Please upload at least one photo.",
        },
        {
          status: 400,
        }
      );
    }

    if (photos.length > 5) {
      return NextResponse.json(
        {
          error:
            "Maximum 5 photos are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is missing from .env.local.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "================================="
    );

    console.log(
      "MEMORA AI ALBUM GENERATION"
    );

    console.log(
      "Gemini model:",
      GEMINI_MODEL
    );

    console.log(
      "Title:",
      title
    );

    console.log(
      "Number of photos:",
      photos.length
    );

    console.log(
      "Starting AI photo analysis..."
    );

    console.log(
      "================================="
    );

    /*
     * IMPORTANT:
     *
     * Process photos ONE AT A TIME.
     *
     * The old Promise.all() sent all photos
     * to Gemini simultaneously, which increases
     * the chance of 503 errors.
     */
    const analyzedPhotos: AnalyzedPhoto[] = [];

    for (const photo of photos) {
      console.log(
        `Starting photo ${photo.id}`
      );

      const analyzed =
        await analyzePhoto(
          photo,
          apiKey
        );

      analyzedPhotos.push(analyzed);

      console.log(
        `Finished photo ${photo.id}`
      );

      /*
       * Small pause between photos.
       *
       * This reduces the chance of sending
       * requests too quickly.
       */
      if (photo !== photos[photos.length - 1]) {
        await wait(1000);
      }
    }

    console.log(
      "All photo analysis completed."
    );

    const story =
      await createAlbumIntroduction(
        title,
        analyzedPhotos,
        apiKey
      );

    console.log(
      "Album introduction generated."
    );

    return NextResponse.json({
      success: true,

      story:
        story ||
        `A collection of meaningful moments from "${title}", brought together to preserve the places, experiences, and feelings captured along the way.`,

      photos: analyzedPhotos,

      captions:
        analyzedPhotos.map(
          (photo) => photo.caption
        ),
    });
  } catch (error: any) {
    console.error(
      "MEMORA API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Gemini failed to generate the album.",
      },
      {
        status: 500,
      }
    );
  }
}