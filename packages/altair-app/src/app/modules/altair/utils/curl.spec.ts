import { describe, expect } from '@jest/globals';
import { generateCurl } from './curl';

describe('generateCurl', () => {
  it('generated expected result', () => {
    const res = generateCurl({
      url: 'https://altairgraphql.dev',
      data: {
        x: '1',
      },
      headers: {
        'X-api-token': 'xyz',
      },
      method: 'POST',
    });

    expect(res).toBe(
      `curl 'https://altairgraphql.dev' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'Origin: http://localhost' -H 'X-api-token: xyz' --data-binary '{"x":"1"}' --compressed`
    );
  });

  it('generates multipart/form-data request with single file upload', () => {
    // Create a mock File object
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    const res = generateCurl({
      url: 'https://altairgraphql.dev/graphql',
      data: {
        query: 'mutation($file: Upload!) { uploadFile(file: $file) }',
        variables: {},
      },
      headers: {
        'X-api-token': 'xyz',
      },
      method: 'POST',
      files: [
        {
          name: 'file',
          data: mockFile,
        },
      ],
    });

    // Should not include Content-Type header (curl will set it with boundary)
    expect(res).not.toContain('Content-Type');

    // Should include operations field with null for file variable
    expect(res).toContain("-F 'operations=");
    expect(res).toContain('"variables":{"file":null}');

    // Should include map field
    expect(res).toContain("-F 'map=");
    expect(res).toContain('"0":["variables.file"]');

    // Should include file field
    expect(res).toContain("-F '0=@test.txt'");

    // Should still include other headers
    expect(res).toContain("'X-api-token: xyz'");
  });

  it('generates multipart/form-data request with multiple file uploads', () => {
    const mockFile1 = new File(['test content 1'], 'test1.txt', { type: 'text/plain' });
    const mockFile2 = new File(['test content 2'], 'test2.txt', { type: 'text/plain' });

    const res = generateCurl({
      url: 'https://altairgraphql.dev/graphql',
      data: {
        query: 'mutation($files: [Upload!]!) { uploadFiles(files: $files) }',
        variables: {},
      },
      method: 'POST',
      files: [
        {
          name: 'files.0',
          data: mockFile1,
        },
        {
          name: 'files.1',
          data: mockFile2,
        },
      ],
    });

    // Should include operations with nulls for both files
    expect(res).toContain('"variables":{"files":{"0":null,"1":null}}');
    
    // Should include map for both files
    expect(res).toContain('"0":["variables.files.0"]');
    expect(res).toContain('"1":["variables.files.1"]');
    
    // Should include both file fields
    expect(res).toContain("-F '0=@test1.txt'");
    expect(res).toContain("-F '1=@test2.txt'");
  });

  it('generates multipart/form-data request with nested file variables', () => {
    const mockFile = new File(['test content'], 'document.pdf', { type: 'application/pdf' });

    const res = generateCurl({
      url: 'https://altairgraphql.dev/graphql',
      data: {
        query: 'mutation($input: CreateInput!) { create(input: $input) }',
        variables: {
          input: {
            name: 'Test',
          },
        },
      },
      method: 'POST',
      files: [
        {
          name: 'input.document',
          data: mockFile,
        },
      ],
    });

    // Should preserve existing variables and set file to null
    expect(res).toContain('"variables":{"input":{"name":"Test","document":null}}');
    
    // Should map to correct nested path
    expect(res).toContain('"0":["variables.input.document"]');
    
    // Should include file field
    expect(res).toContain("-F '0=@document.pdf'");
  });
});
