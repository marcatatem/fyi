import { RenderingMode } from "html/app.tsx";
import { imgixAsset, mediaQuery, pathForAsset } from "html/helpers.ts";

type SectionProps = {
  mode: RenderingMode;
  figure: {
    src: string;
    alt: string;
    maxWidth: number;
    maxHeight: number;
    caption: string;
  };
};

export const Figure = ({ mode, figure }: SectionProps) => {
  return (
    <figure>
      {(mode === "development")
        ? (
          <picture>
            <img
              src={pathForAsset("img", figure.src)}
              alt={figure.alt}
              loading="lazy"
              width={`${figure.maxWidth}`}
              height={`${figure.maxHeight}`}
              style={`width: 100%; max-width: ${figure.maxWidth}px; height: auto`}
            />
          </picture>
        )
        : (
          <picture>
            <source
              media={mediaQuery("max", 430, true)}
              srcset={imgixAsset(pathForAsset("img", figure.src), {
                w: 430,
                fm: "webp",
                lossless: true,
                dpr: 2,
              })}
            />
            <source
              media={mediaQuery("max", 1024, true)}
              srcset={imgixAsset(pathForAsset("img", figure.src), {
                w: 1024,
                fm: "webp",
                lossless: true,
                dpr: 2,
              })}
            />
            <source
              media={mediaQuery("min", 1024, true)}
              srcset={imgixAsset(pathForAsset("img", figure.src), {
                w: figure.maxWidth,
                fm: "webp",
                lossless: true,
                dpr: 2,
              })}
            />
            {/* lower dpi */}
            <source
              media={mediaQuery("max", 430)}
              srcset={imgixAsset(pathForAsset("img", figure.src), {
                w: 430,
                fm: "webp",
                lossless: true,
                dpr: 1,
              })}
            />
            <source
              media={mediaQuery("max", 1024)}
              srcset={imgixAsset(pathForAsset("img", figure.src), {
                w: 1024,
                fm: "webp",
                lossless: true,
                dpr: 1,
              })}
            />
            <source
              media={mediaQuery("min", 1024)}
              srcset={imgixAsset(pathForAsset("img", figure.src), {
                w: figure.maxWidth,
                fm: "webp",
                lossless: true,
                dpr: 1,
              })}
            />
            <img
              src={imgixAsset(pathForAsset("img", figure.src))}
              alt={figure.alt}
              loading="lazy"
              width={`${figure.maxWidth}`}
              height={`${figure.maxHeight}`}
              style={`width: 100%; max-width: ${figure.maxWidth}px; height: auto`}
            />
          </picture>
        )}
      <figcaption>{figure.caption}</figcaption>
    </figure>
  );
};
