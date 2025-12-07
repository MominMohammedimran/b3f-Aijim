import React, { createContext, ReactNode, useContext } from "react";
import { IKContext } from "imagekitio-react";

interface Props {
  children: ReactNode;
}

const ImageKitProvider: React.FC<Props> = ({ children }) => {
  return (
    <IKContext
      publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY}
      urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
      transformationPosition="path"
     // optional
    >
      {children}
    </IKContext>
  );
};

export default ImageKitProvider;
