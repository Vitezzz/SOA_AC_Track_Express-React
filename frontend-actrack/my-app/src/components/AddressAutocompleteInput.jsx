import { useEffect, useRef } from "react";

const AddressAutocompleteInput = ({ value, onChange, className }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (!window.google || !inputRef.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ["address"],
            componentRestrictions: { country: "mx" },
        });

        const listener = autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
                onChange(place.formatted_address);
            }
        });

        return () => {
            window.google.maps.event.removeListener(listener);
        };
    }, [onChange]);

    return (
        <input
            ref={inputRef}
            type="text"
            className={className}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Empieza a escribir tu dirección..."
        />
    );
};

export default AddressAutocompleteInput;