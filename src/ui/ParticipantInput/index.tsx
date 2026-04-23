import { CSSProperties, FC, useEffect, useMemo, useRef, useState } from "react";
import { ContestParticipant } from "../../api";
import Input from "../Input";
import Portal from "../Portal";
import { useDebounce } from "../../utils/debounce";

import "../AccountInput/index.scss";

export const getParticipantTitle = (
  participant: ContestParticipant
): string => {
  if (participant.user) {
    return participant.user.login;
  }
  if (participant.scope_user) {
    return participant.scope_user.title ?? participant.scope_user.login;
  }
  if (participant.scope) {
    return participant.scope.title ?? String(participant.scope.id);
  }
  if (participant.group) {
    return participant.group.title ?? String(participant.group.id);
  }
  if (participant.fake) {
    return participant.fake.title;
  }
  return "";
};

export type ParticipantInputProps = {
  placeholder?: string;
  disabled?: boolean;
  query?: string;
  onQueryChange?(query?: string): void;
  participant?: ContestParticipant;
  onParticipantChange?(participant?: ContestParticipant): void;
  participants?: ContestParticipant[];
};

const ParticipantInput: FC<ParticipantInputProps> = (props) => {
  const {
    placeholder,
    disabled,
    query,
    onQueryChange,
    participant,
    onParticipantChange,
    participants,
  } = props;
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  if (participant && !query && onQueryChange) {
    onQueryChange(getParticipantTitle(participant));
  }
  const updateStyle = () => {
    if (!ref.current) {
      return;
    }
    const element = ref.current;
    setStyle({
      top:
        element.getBoundingClientRect().top +
        window.scrollY +
        element.offsetHeight,
      left: element.getBoundingClientRect().left + window.scrollX,
      minWidth: element.offsetWidth,
    });
  };
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    updateStyle();
    window.addEventListener("resize", updateStyle);
    window.addEventListener("scroll", updateStyle, true);
    return () => {
      window.removeEventListener("resize", updateStyle);
      window.removeEventListener("scroll", updateStyle, true);
    };
  }, [ref, focused]);
  const updateQuery = (query: string) => {
    if (onQueryChange) {
      onQueryChange(query);
    }
    if (onParticipantChange) {
      onParticipantChange(undefined);
    }
  };
  const updateParticipant = (participant: ContestParticipant) => {
    if (onQueryChange) {
      onQueryChange(getParticipantTitle(participant));
    }
    if (onParticipantChange) {
      onParticipantChange(participant);
    }
  };
  const debouncedQuery = useDebounce(query, 200);
  const filteredParticipants = useMemo(() => {
    if (!participants) {
      return [];
    }
    const filtered = participants.filter((p) => {
      if (p.scope || p.group) {
        return false;
      }
      if (!debouncedQuery) {
        return true;
      }
      const title = getParticipantTitle(p).toLowerCase();
      return title.includes(debouncedQuery.toLowerCase());
    });
    return filtered;
  }, [participants, debouncedQuery]);
  return (
    <>
      <Input
        value={query}
        onValueChange={updateQuery}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        ref={ref}
      />
      {focused && !disabled && (
        <Portal>
          <div
            className="ui-search-portal"
            style={style}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
          >
            <div className="search-box">
              <ul className="items">
                {filteredParticipants.map(
                  (item: ContestParticipant, key: number) => {
                    return (
                      <li
                        className={
                          item.id === participant?.id ? "selected" : undefined
                        }
                        onClick={() => updateParticipant(item)}
                        key={key}
                      >
                        <span className="title">
                          {getParticipantTitle(item)}
                        </span>
                      </li>
                    );
                  }
                )}
              </ul>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default ParticipantInput;
