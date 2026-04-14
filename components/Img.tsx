import { basePath } from "@/lib/basePath";

export default function Img(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const raw = props.src;
  const src = typeof raw === "string" && raw.startsWith("/") ? `${basePath}${raw}` : raw;
  return <img {...props} src={src} />;
}
