import ImageKit from "imagekit-javascript";

// ImageKit configuration
const imagekit = new ImageKit({
  publicKey: "public_fPWb/qD9WzG7PvEMuQddkKTj5ko=",
  urlEndpoint: "https://ik.imagekit.io/o5ewoek4p",
});

export const uploadToImageKit = async (
  file: File,
  folder: string,
  fileName?: string
): Promise<string> => {
  const uniqueFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  return new Promise((resolve, reject) => {
    // Get authentication parameters from edge function
    fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://zfdsrtwjxwzwbrtfgypm.supabase.co'}/functions/v1/imagekit-auth`, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(authParams => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          
          imagekit.upload({
            file: base64,
            fileName: uniqueFileName,
            folder: `/${folder}`,
            ...authParams
          }, (err, result) => {
            if (err) {
              reject(err);
            } else if (result) {
              resolve(result.url);
            }
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })
      .catch(reject);
  });
};

export default imagekit;