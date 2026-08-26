import {
  useState,
} from "react";


export default function DecisionPanel({
  onApprove,
  onReject,
  disabled = false,
  seniorReviewRequired = false,
}) {

  const [
    comment,
    setComment,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const approve =
    () => {

      if (
        !comment.trim()
      ) {

        setError(
          "Comment is required."
        );

        return;

      }


      if (
        seniorReviewRequired
      ) {

        setError(
          "Senior Agent Review is required for this claim."
        );

        return;

      }


      setError("");


      if (
        typeof onApprove ===
        "function"
      ) {

        onApprove(
          comment.trim()
        );

      }

    };


  const reject =
    () => {

      if (
        !comment.trim()
      ) {

        setError(
          "Comment is required."
        );

        return;

      }


      setError("");


      if (
        typeof onReject ===
        "function"
      ) {

        onReject(
          comment.trim()
        );

      }

    };


  return (
    <div>

      {seniorReviewRequired && (

        <div className="alert alert-warning small">

          <strong>
            Senior Agent Review Required.
          </strong>

          <div>
            This claim exceeds the automatic approval threshold.
          </div>

        </div>

      )}


      {error && (

        <div className="alert alert-danger small">
          {error}
        </div>

      )}


      <label className="form-label fw-semibold">
        Decision Comment
      </label>


      <textarea
        className="form-control mb-3"
        rows="5"
        placeholder="Enter your decision reason..."
        value={
          comment
        }
        onChange={e =>
          setComment(
            e.target.value
          )
        }
        disabled={
          disabled
        }
      />


      <div className="d-grid gap-2">

        <button
          type="button"
          className="btn btn-success"
          disabled={
            disabled ||
            seniorReviewRequired
          }
          onClick={
            approve
          }
        >
          ✓ Approve
        </button>


        <button
          type="button"
          className="btn btn-danger"
          disabled={
            disabled
          }
          onClick={
            reject
          }
        >
          ✕ Reject
        </button>

      </div>

    </div>
  );
}
