// Photo textures from CI/Content, picked in the texture lab (22.10.2026), in colour.
// Multiply darkens the ivory sections, screen lightens the black ones.
export const TEXTURES = {
  marmor: { src: '/textures/marmor.jpg', opacity: 0.4, blend: 'multiply' },
  damast: { src: '/textures/damast.jpg', opacity: 0.2, blend: 'screen' },
  irisierend: { src: '/textures/irisierend.jpg', opacity: 0.4, blend: 'screen' },
  // Gold gradient from CI/Content, stored in greyscale.
  verlauf: { src: '/textures/verlauf-grau.jpg', opacity: 0.5, blend: 'multiply' },
};

// Sits behind the section content: the section needs position relative and
// isolation isolate, the content wrapper position relative.
export default function Texture({ name }) {
  const t = TEXTURES[name];
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `url(${t.src}) center / cover no-repeat`,
      opacity: t.opacity, mixBlendMode: t.blend,
    }} />
  );
}
