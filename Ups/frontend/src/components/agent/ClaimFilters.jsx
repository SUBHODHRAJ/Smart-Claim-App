export default function ClaimFilters({
  filters = {},
  onChange,
  onClear,
}) {

  const update =
    (
      field,
      value
    ) => {

      if (
        typeof onChange ===
        "function"
      ) {

        onChange({
          [field]:
            value,
        });

      }

    };


  return (
    <div className="row g-2">

      <div className="col-12 col-md-4">

        <input
          type="text"
          className="form-control"
          placeholder="Search claim or package ID..."
          value={
            filters.search ||
            ""
          }
          onChange={e =>
            update(
              "search",
              e.target.value
            )
          }
        />

      </div>


      <div className="col-6 col-md-2">

        <select
          className="form-select"
          value={
            filters.status ||
            ""
          }
          onChange={e =>
            update(
              "status",
              e.target.value
            )
          }
        >

          <option value="">
            Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="UnderReview">
            Under Review
          </option>

          <option value="SeniorAgentReview">
            Senior Review
          </option>

          <option value="Approved">
            Approved
          </option>

          <option value="Rejected">
            Rejected
          </option>

        </select>

      </div>


      <div className="col-6 col-md-2">

        <select
          className="form-select"
          value={
            filters.damageType ||
            ""
          }
          onChange={e =>
            update(
              "damageType",
              e.target.value
            )
          }
        >

          <option value="">
            Damage Type
          </option>

          <option value="Damaged">
            Damaged
          </option>

          <option value="Lost">
            Lost
          </option>

          <option value="Missing">
            Missing
          </option>

          <option value="Tampered">
            Tampered
          </option>

          <option value="Other">
            Other
          </option>

        </select>

      </div>


      <div className="col-6 col-md-2">

        <select
          className="form-select"
          value={
            filters.priority ||
            ""
          }
          onChange={e =>
            update(
              "priority",
              e.target.value
            )
          }
        >

          <option value="">
            Priority
          </option>

          <option value="Low">
            Low
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="High">
            High
          </option>

          <option value="Critical">
            Critical
          </option>

        </select>

      </div>


      <div className="col-6 col-md-2">

        <button
          type="button"
          className="btn btn-outline-secondary w-100"
          onClick={
            onClear
          }
        >
          Clear Filters
        </button>

      </div>

    </div>
  );
}
