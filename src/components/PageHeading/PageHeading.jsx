import { FaArrowLeftLong } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

function PageHeading({ title }) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-left"
                aria-label="Go back"
            >
                <FaArrowLeftLong />
                <h1 className="font-semibold text-xl">{title}</h1>
            </button>
        </div>
    );
}

export default PageHeading;
