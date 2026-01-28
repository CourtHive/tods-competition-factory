import React, { useEffect, useRef, useState } from 'react';

/**
 * Wrapper component for the Category editor from courthive-components
 */
export default function CategoryEditorDemo() {
  const containerRef = useRef(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Dynamically import courthive-components
    import('courthive-components')
      .then(({ getCategoryModal }) => {
        if (containerRef.current) {
          // Clear previous content
          containerRef.current.innerHTML = '';

          // Create description
          const description = document.createElement('div');
          description.style.marginBottom = '1em';
          description.style.color = '#666';
          description.innerHTML =
            'The Category editor allows you to define complete category information including age categories, ' +
            'ratings, and ball types. Click different buttons to see examples of each category type.';

          // Create button container
          const buttonContainer = document.createElement('div');
          buttonContainer.style.display = 'flex';
          buttonContainer.style.gap = '0.5em';
          buttonContainer.style.flexWrap = 'wrap';
          buttonContainer.style.marginBottom = '1em';

          // Create buttons for different category types
          const categoryTypes = [
            {
              label: 'New Category',
              intent: 'primary',
              category: null,
            },
            {
              label: 'Age Category Example',
              intent: 'success',
              category: {
                categoryName: 'Boys U14',
                type: 'AGE',
                ageCategoryCode: '14U',
                ballType: 'TYPE1FAST',
              },
            },
            {
              label: 'Rating Category Example',
              intent: 'warning',
              category: {
                categoryName: 'Open 4.0-4.5',
                type: 'RATING',
                ratingType: 'NTRP',
                ratingMin: 4.0,
                ratingMax: 4.5,
              },
            },
            {
              label: 'Combined Category Example',
              intent: 'info',
              category: {
                categoryName: 'Junior Elite U16',
                type: 'BOTH',
                ageCategoryCode: '16U',
                ratingType: 'UTR',
                ratingMin: 10.0,
                ratingMax: 13.0,
              },
            },
          ];

          categoryTypes.forEach(({ label, intent, category }) => {
            const button = document.createElement('button');
            button.className = `button button--${intent}`;
            button.textContent = label;
            button.onclick = () => {
              getCategoryModal({
                existingCategory: category,
                callback: (updatedCategory) => {
                  setResult(updatedCategory);
                  setError(null);
                },
              });
            };
            buttonContainer.appendChild(button);
          });

          containerRef.current.appendChild(description);
          containerRef.current.appendChild(buttonContainer);
        }
      })
      .catch((err) => {
        console.error('Failed to load Category editor:', err);
        setError('Failed to load editor. Please ensure courthive-components is installed.');
      });
  }, []);

  return (
    <div style={{ margin: '1em 0', padding: '1em', background: '#f6f8fa', borderRadius: '8px' }}>
      <div ref={containerRef}></div>

      {error && (
        <div
          style={{
            padding: '1em',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c00',
            marginTop: '1em',
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: '1em',
            padding: '1em',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          <strong>Selected Category:</strong>
          <pre
            style={{
              marginTop: '0.5em',
              padding: '1em',
              background: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.85em',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
          {result.ageCategoryCode && (
            <div
              style={{
                marginTop: '1em',
                padding: '1em',
                background: '#e8f5e9',
                border: '1px solid #c8e6c9',
                borderRadius: '4px',
              }}
            >
              <strong style={{ color: '#2e7d32' }}>Age Category Details:</strong>
              <br />
              <div style={{ marginTop: '0.5em', fontSize: '0.9em' }}>
                <strong>Code:</strong> {result.ageCategoryCode}
                <br />
                {result.ageMin && (
                  <>
                    <strong>Min Age:</strong> {result.ageMin}
                    <br />
                  </>
                )}
                {result.ageMax && (
                  <>
                    <strong>Max Age:</strong> {result.ageMax}
                    <br />
                  </>
                )}
                {result.ageMinDate && (
                  <>
                    <strong>Min Birth Date:</strong> {result.ageMinDate}
                    <br />
                  </>
                )}
                {result.ageMaxDate && (
                  <>
                    <strong>Max Birth Date:</strong> {result.ageMaxDate}
                    <br />
                  </>
                )}
              </div>
            </div>
          )}
          <div style={{ marginTop: '0.5em', fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>
            Click any button again to modify the category
          </div>
        </div>
      )}
    </div>
  );
}
