/**
 * Fetches data from the API
 * @param url The URL to fetch from
 * @param options Fetch options
 * @returns The JSON response
 */
export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred while fetching the data.');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

/**
 * Makes a POST request to the API
 * @param url The URL to post to
 * @param data The data to post
 * @returns The JSON response
 */
export async function postApi<T>(url: string, data: any): Promise<T> {
  return fetchApi<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Makes a PUT request to the API
 * @param url The URL to put to
 * @param data The data to put
 * @returns The JSON response
 */
export async function putApi<T>(url: string, data: any): Promise<T> {
  return fetchApi<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Makes a DELETE request to the API
 * @param url The URL to delete from
 * @returns The JSON response
 */
export async function deleteApi<T>(url: string): Promise<T> {
  return fetchApi<T>(url, {
    method: 'DELETE',
  });
}

/**
 * Uploads a file to the API
 * @param url The URL to upload to
 * @param file The file to upload
 * @param additionalData Additional form data to include
 * @returns The JSON response
 */
export async function uploadFile<T>(url: string, file: File, additionalData?: Record<string, string>): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred while uploading the file.');
  }

  return await response.json();
}

/**
 * Formats an error message from an API response
 * @param error The error object
 * @returns A user-friendly error message
 */
export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
