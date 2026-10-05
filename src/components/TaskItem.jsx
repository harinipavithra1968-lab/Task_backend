function TaskImage({ src, alt }) {
  const [imageSrc, setImageSrc] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let objectUrl;

    const loadImage = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('No login token found');
          return;
        }

        console.log('Loading task image:', src);

        const response = await fetch(src, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Image response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            'Image server error:',
            response.status,
            errorText
          );
          throw new Error(
            `Image request failed: ${response.status}`
          );
        }

        const blob = await response.blob();

        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        setImageError(false);
      } catch (error) {
        console.error(
          'Task image loading failed:',
          error
        );
        setImageError(true);
      }
    };

    loadImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (imageError) {
    return (
      <div className="task-image-error">
        Image could not be loaded
      </div>
    );
  }

  if (!imageSrc) return null;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="task-image"
    />
  );
}