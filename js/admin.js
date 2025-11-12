$(document).ready(() => {
  $('#login-btn').on('click', () => {
    const username = $('#username').val();
    const password = $('#password').val();

    if (username === 'admin' && password === 'admin123') {
      $('#login').hide();
      $('#dashboard').show();
    } else {
      alert('Invalid credentials');
    }
  });

  $('#save-global-rtp').on('click', () => {
    const rtp = $('#global-rtp').val();
    $.ajax({
      url: '/api/admin/rtp',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ rtp }),
      success: () => {
        alert('Global RTP saved');
      }
    });
  });

  $('#save-user-rtp').on('click', () => {
    const id = $('#user-id').val();
    const rtp = $('#user-rtp').val();
    $.ajax({
      url: '/api/user',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ id, rtp }),
      success: () => {
        alert('User RTP saved');
      }
    });
  });

  $('#save-user-credits').on('click', () => {
    const id = $('#user-id-credits').val();
    const credits = $('#user-credits').val();
    $.ajax({
      url: '/api/user',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ id, credits }),
      success: () => {
        alert('User credits saved');
      }
    });
  });
});
