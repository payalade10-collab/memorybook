export async function POST(req: Request) {
  try {
    const { memoryPrompt, photoCount, style } = await req.json();

    const story = `
${memoryPrompt}

These ${photoCount || 1} beautiful photographs capture the heart of this ${
      style || "special"
    } memory.

What makes these moments special is not simply what happened, but the
people, emotions, laughter and little details that made the experience
worth remembering.

Looking back at these memories reminds us that some of life's greatest
treasures are the simple moments we share together. Every photograph
holds a piece of that story, and together they create a memory worth
keeping forever.

May these moments always bring a smile, and may this little scrapbook
remain a reminder of the happiness that was shared.
`;

    const captions = Array.from(
      { length: Number(photoCount) || 1 },
      (_, index) =>
        [
          "A beautiful moment worth remembering ❤️",
          "A little piece of happiness ✨",
          "One of those moments we wish could last forever 🌸",
          "Smiles, memories and people who matter ❤️",
          "A memory to look back on with a smile ✨",
        ][index % 5]
    );

    return Response.json({
      story,
      captions,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Failed to create story",
      },
      {
        status: 500,
      }
    );
  }
}