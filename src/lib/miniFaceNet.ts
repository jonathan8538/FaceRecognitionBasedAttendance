import * as ort from "onnxruntime-web";

let session: ort.InferenceSession | null = null;

export async function loadMiniFaceNet() {
  if (!session) {
    session = await ort.InferenceSession.create("/models/minifacenet_256d.onnx");
  }
  return session;
}

export async function getEmbedding(imageData: ImageData): Promise<number[]> {
  const session = await loadMiniFaceNet();

  // Preprocess -> 112x112, normalized tensor
  const tensor = preprocessToTensor(imageData);

  const feeds: Record<string, ort.Tensor> = {
    input: tensor, // depends on model input name
  };

  const output = await session.run(feeds);
  const embedding = output["embeddings"].data as number[];

  return Array.from(embedding);
}
