export default function ImagePreview({
  files = [],
  onRemove,
}) {

  if (
    files.length === 0
  ) {

    return null;
  }


  return (
    <div className="row g-3 mt-1">

      {files.map(
        (
          item,
          index
        ) => {

          const file =
            item?.file ??
            item;


          const preview =
            item?.preview ??
            (
              file instanceof File
                ? URL.createObjectURL(
                    file
                  )
                : ""
            );


          return (

            <div
              className="col-6 col-md-4 col-lg-3"
              key={
                `${file?.name ?? "file"}-${index}`
              }
            >

              <div className="card border h-100">

                <div
                  className="position-relative"
                  style={{
                    height:
                      "150px",
                  }}
                >

                  {preview ? (

                    <img
                      src={
                        preview
                      }
                      alt={
                        file?.name ||
                        `Evidence ${index + 1}`
                      }
                      className="w-100 h-100 rounded-top"
                      style={{
                        objectFit:
                          "cover",
                      }}
                    />

                  ) : (

                    <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                      📷
                    </div>

                  )}


                  {onRemove && (

                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                      onClick={() =>
                        onRemove(
                          index
                        )
                      }
                      aria-label="Remove image"
                    >
                      ×
                    </button>

                  )}

                </div>


                <div className="card-body p-2">

                  <div
                    className="small fw-semibold text-truncate"
                    title={
                      file?.name
                    }
                  >
                    {file?.name ||
                      `Evidence ${index + 1}`}
                  </div>

                  {file?.size && (

                    <div className="small text-muted">
                      {(
                        file.size /
                        1024 /
                        1024
                      ).toFixed(2)}
                      {" "}MB
                    </div>

                  )}

                </div>

              </div>

            </div>

          );
        }
      )}

    </div>
  );
}
