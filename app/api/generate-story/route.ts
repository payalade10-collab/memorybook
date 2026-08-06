export async function POST(req: Request) {
  const { memoryPrompt } = await req.json();

  const story = `
${memoryPrompt}

This memory is a beautiful reminder that life's greatest treasures are the moments we share with the people we love. Every smile captured in these photographs tells a story of happiness, togetherness, and unforgettable experiences. Looking back at these memories fills the heart with gratitude and reminds us that every journey, every laugh, and every adventure becomes a part of who we are. May these moments continue to inspire joy and remain cherished forever.
`;

  return Response.json({
    story,
  });
}